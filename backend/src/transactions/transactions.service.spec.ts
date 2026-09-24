import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { TransactionWithCategory } from './dto/transaction-response.dto';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let prisma: DeepMockProxy<PrismaService>;
  let categoriesService: MockProxy<CategoriesService>;
  let service: TransactionsService;

  const transaction: TransactionWithCategory = {
    id: 'tx-1',
    description: 'Almoço',
    amount: new Prisma.Decimal('45.90'),
    type: TransactionType.EXPENSE,
    date: new Date('2026-09-20T00:00:00Z'),
    categoryId: 'cat-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: 'cat-1', name: 'Alimentação' },
  };

  const listQuery = (plain: Record<string, string>): ListTransactionsQueryDto =>
    plainToInstance(ListTransactionsQueryDto, plain);

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    categoriesService = mock<CategoriesService>();
    service = new TransactionsService(prisma, categoriesService);
  });

  describe('findAll', () => {
    it('applies user scope, filters and pagination and returns meta', async () => {
      prisma.$transaction.mockResolvedValue([[transaction], 21]);

      const result = await service.findAll(
        'user-1',
        listQuery({
          page: '3',
          limit: '10',
          type: 'EXPENSE',
          categoryId: 'cat-1',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
        }),
      );

      const expectedWhere = {
        userId: 'user-1',
        type: 'EXPENSE',
        categoryId: 'cat-1',
        date: {
          gte: new Date('2026-09-01T00:00:00Z'),
          lte: new Date('2026-09-30T00:00:00Z'),
        },
      };
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere, skip: 20, take: 10 }),
      );
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        total: 21,
        totalPages: 3,
      });
      expect(result.items[0]).toMatchObject({
        amount: 45.9,
        date: '2026-09-20',
        category: { id: 'cat-1', name: 'Alimentação' },
      });
    });

    it('rejects a period where startDate is after endDate', async () => {
      await expect(
        service.findAll(
          'user-1',
          listQuery({ startDate: '2026-10-01', endDate: '2026-09-01' }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  it('does not create a transaction in a category owned by another user', async () => {
    categoriesService.findOwned.mockRejectedValue(
      new NotFoundException('Category not found'),
    );

    await expect(
      service.create('user-1', {
        description: 'Almoço',
        amount: 45.9,
        type: TransactionType.EXPENSE,
        date: '2026-09-20',
        categoryId: 'foreign-cat',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(categoriesService.findOwned).toHaveBeenCalledWith(
      'user-1',
      'foreign-cat',
    );
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it.each([
    ['update', (s: TransactionsService) => s.update('user-2', 'tx-1', {})],
    ['remove', (s: TransactionsService) => s.remove('user-2', 'tx-1')],
  ])(
    'returns 404 on %s of a transaction owned by another user',
    async (_, act) => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(act(service)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', userId: 'user-2' },
      });
      expect(prisma.transaction.update).not.toHaveBeenCalled();
      expect(prisma.transaction.delete).not.toHaveBeenCalled();
    },
  );
});
