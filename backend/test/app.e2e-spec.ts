import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { App } from 'supertest/types';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

interface AuthBody {
  data: { accessToken: string; user: { id: string; email: string } };
}

interface EntityBody {
  data: { id: string };
}

describe('Fintech API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const runId = randomUUID().slice(0, 8);
  const emails = [`alice-${runId}@e2e.test`, `bob-${runId}@e2e.test`];

  const register = async (email: string): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'E2E User', email, password: 'secret123' })
      .expect(201);
    return (res.body as AuthBody).data.accessToken;
  };

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await app.close();
  });

  it('protects routes and enforces per-user data isolation end to end', async () => {
    const server = app.getHttpServer();

    await request(server).get('/api/transactions').expect(401);

    const aliceToken = await register(emails[0]);
    const bobToken = await register(emails[1]);

    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: emails[0].toUpperCase(), password: 'secret123' })
      .expect(200);
    expect((login.body as AuthBody).data.accessToken).toEqual(
      expect.any(String),
    );

    const category = await request(server)
      .post('/api/categories')
      .set(auth(aliceToken))
      .send({ name: 'Fornecedor' })
      .expect(201);
    const categoryId = (category.body as EntityBody).data.id;

    const invalid = await request(server)
      .post('/api/transactions')
      .set(auth(aliceToken))
      .send({ description: '', amount: -5, type: 'OTHER', date: '2026-02-30' })
      .expect(400);
    expect(invalid.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining([
        'type must be one of the following values: INCOME, EXPENSE',
      ]) as unknown,
    });

    const created = await request(server)
      .post('/api/transactions')
      .set(auth(aliceToken))
      .send({
        description: 'Compra de insumos',
        amount: 250.75,
        type: 'EXPENSE',
        date: '2026-09-10',
        categoryId,
      })
      .expect(201);
    const transactionId = (created.body as EntityBody).data.id;

    await request(server)
      .post('/api/transactions')
      .set(auth(aliceToken))
      .send({
        description: 'Cliente Alfa',
        amount: 1000,
        type: 'INCOME',
        date: '2026-09-15',
        categoryId,
      })
      .expect(201);

    await request(server)
      .post('/api/transactions')
      .set(auth(bobToken))
      .send({
        description: 'Tentativa',
        amount: 10,
        type: 'EXPENSE',
        date: '2026-09-10',
        categoryId,
      })
      .expect(404);
    await request(server)
      .patch(`/api/transactions/${transactionId}`)
      .set(auth(bobToken))
      .send({ amount: 1 })
      .expect(404);
    await request(server)
      .delete(`/api/transactions/${transactionId}`)
      .set(auth(bobToken))
      .expect(404);

    const bobList = await request(server)
      .get('/api/transactions')
      .set(auth(bobToken))
      .expect(200);
    expect(bobList.body).toEqual({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    const filtered = await request(server)
      .get('/api/transactions')
      .query({
        type: 'EXPENSE',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      })
      .set(auth(aliceToken))
      .expect(200);
    expect(filtered.body).toMatchObject({
      data: [{ id: transactionId, amount: 250.75, date: '2026-09-10' }],
      meta: { total: 1 },
    });

    const summary = await request(server)
      .get('/api/dashboard/summary')
      .set(auth(aliceToken))
      .expect(200);
    expect(summary.body).toEqual({
      data: {
        balance: 749.25,
        totalIncome: 1000,
        totalExpense: 250.75,
        topExpenseCategories: [
          { categoryId, name: 'Fornecedor', total: 250.75 },
        ],
        period: { startDate: null, endDate: null },
      },
    });

    await request(server)
      .delete(`/api/categories/${categoryId}`)
      .set(auth(aliceToken))
      .expect(409);
    await request(server)
      .delete(`/api/transactions/${transactionId}`)
      .set(auth(aliceToken))
      .expect(204);
  });
});
