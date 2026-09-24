import { Prisma, PrismaClient, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USER = {
  name: 'Usuário Demo',
  email: 'demo@fintech.com',
  password: 'Demo@1234',
};

const CATEGORIES = [
  { name: 'Alimentação', description: 'Refeições e mercado' },
  { name: 'Transporte', description: 'Combustível, aplicativos e pedágios' },
  { name: 'Fornecedor', description: 'Pagamentos a fornecedores' },
  { name: 'Receita de Cliente', description: 'Recebimentos de clientes' },
  { name: 'Reembolso', description: 'Reembolsos de despesas' },
] as const;

type CategoryName = (typeof CATEGORIES)[number]['name'];

interface SeedTransaction {
  description: string;
  amount: number;
  type: TransactionType;
  daysAgo: number;
  category: CategoryName;
}

const TRANSACTIONS: SeedTransaction[] = [
  {
    description: 'Contrato mensal - Cliente Alfa',
    amount: 8500,
    type: 'INCOME',
    daysAgo: 2,
    category: 'Receita de Cliente',
  },
  {
    description: 'Projeto pontual - Cliente Beta',
    amount: 3200,
    type: 'INCOME',
    daysAgo: 9,
    category: 'Receita de Cliente',
  },
  {
    description: 'Reembolso de viagem',
    amount: 420.5,
    type: 'INCOME',
    daysAgo: 5,
    category: 'Reembolso',
  },
  {
    description: 'Compra de insumos',
    amount: 2350.75,
    type: 'EXPENSE',
    daysAgo: 3,
    category: 'Fornecedor',
  },
  {
    description: 'Licenças de software',
    amount: 1180,
    type: 'EXPENSE',
    daysAgo: 12,
    category: 'Fornecedor',
  },
  {
    description: 'Almoço com cliente',
    amount: 186.4,
    type: 'EXPENSE',
    daysAgo: 1,
    category: 'Alimentação',
  },
  {
    description: 'Mercado do escritório',
    amount: 412.9,
    type: 'EXPENSE',
    daysAgo: 7,
    category: 'Alimentação',
  },
  {
    description: 'Combustível',
    amount: 250,
    type: 'EXPENSE',
    daysAgo: 4,
    category: 'Transporte',
  },
  {
    description: 'Corridas de aplicativo',
    amount: 96.3,
    type: 'EXPENSE',
    daysAgo: 10,
    category: 'Transporte',
  },
  {
    description: 'Contrato mensal - Cliente Alfa',
    amount: 8500,
    type: 'INCOME',
    daysAgo: 32,
    category: 'Receita de Cliente',
  },
  {
    description: 'Manutenção de equipamentos',
    amount: 1640,
    type: 'EXPENSE',
    daysAgo: 35,
    category: 'Fornecedor',
  },
  {
    description: 'Pedágios',
    amount: 74.8,
    type: 'EXPENSE',
    daysAgo: 38,
    category: 'Transporte',
  },
  {
    description: 'Café e lanches',
    amount: 132.15,
    type: 'EXPENSE',
    daysAgo: 41,
    category: 'Alimentação',
  },
  {
    description: 'Reembolso de material',
    amount: 210,
    type: 'INCOME',
    daysAgo: 44,
    category: 'Reembolso',
  },
  {
    description: 'Contrato mensal - Cliente Alfa',
    amount: 8500,
    type: 'INCOME',
    daysAgo: 62,
    category: 'Receita de Cliente',
  },
  {
    description: 'Serviço de limpeza',
    amount: 900,
    type: 'EXPENSE',
    daysAgo: 65,
    category: 'Fornecedor',
  },
  {
    description: 'Confraternização da equipe',
    amount: 780,
    type: 'EXPENSE',
    daysAgo: 70,
    category: 'Alimentação',
  },
];

function daysAgo(days: number): Date {
  const today = new Date();
  return new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - days,
    ),
  );
}

async function main(): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
  });
  if (existing) {
    console.log(`Seed skipped: ${DEMO_USER.email} already exists`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        passwordHash: await bcrypt.hash(DEMO_USER.password, 10),
      },
    });

    const categoryIds = new Map<CategoryName, string>();
    for (const category of CATEGORIES) {
      const created = await tx.category.create({
        data: { ...category, userId: user.id },
      });
      categoryIds.set(category.name, created.id);
    }

    await tx.transaction.createMany({
      data: TRANSACTIONS.map(
        (transaction): Prisma.TransactionCreateManyInput => ({
          description: transaction.description,
          amount: new Prisma.Decimal(transaction.amount),
          type: transaction.type,
          date: daysAgo(transaction.daysAgo),
          categoryId: categoryIds.get(transaction.category)!,
          userId: user.id,
        }),
      ),
    });
  });

  console.log(`Seed completed: ${DEMO_USER.email} / ${DEMO_USER.password}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
