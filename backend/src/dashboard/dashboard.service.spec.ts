import { Prisma, TransactionType } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

interface SumGroup {
  type?: TransactionType;
  categoryId?: string;
  _sum: { amount: Prisma.Decimal | null };
}

type GroupByMock = jest.Mock<
  Promise<SumGroup[]>,
  [Prisma.TransactionGroupByArgs]
>;

describe('DashboardService', () => {
  let prisma: DeepMockProxy<PrismaService>;
  let groupBy: GroupByMock;
  let service: DashboardService;

  const decimal = (value: string): Prisma.Decimal => new Prisma.Decimal(value);
  const typeGroups = (income: string, expense: string): SumGroup[] => [
    { type: TransactionType.INCOME, _sum: { amount: decimal(income) } },
    { type: TransactionType.EXPENSE, _sum: { amount: decimal(expense) } },
  ];

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    groupBy = prisma.transaction.groupBy as unknown as GroupByMock;
    service = new DashboardService(prisma);
  });

  it('computes all-time balance, period totals and top expense categories', async () => {
    groupBy
      .mockResolvedValueOnce(typeGroups('1000.30', '0.10'))
      .mockResolvedValueOnce(typeGroups('500.00', '0.20'))
      .mockResolvedValueOnce([
        { categoryId: 'cat-b', _sum: { amount: decimal('0.15') } },
        { categoryId: 'cat-a', _sum: { amount: decimal('0.05') } },
      ]);
    prisma.category.findMany.mockResolvedValue([
      { id: 'cat-a', name: 'Transporte' },
      { id: 'cat-b', name: 'Fornecedor' },
    ] as Awaited<ReturnType<PrismaService['category']['findMany']>>);

    const summary = await service.getSummary('user-1', {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    });

    expect(summary).toEqual({
      balance: 1000.2,
      totalIncome: 500,
      totalExpense: 0.2,
      topExpenseCategories: [
        { categoryId: 'cat-b', name: 'Fornecedor', total: 0.15 },
        { categoryId: 'cat-a', name: 'Transporte', total: 0.05 },
      ],
      period: { startDate: '2026-09-01', endDate: '2026-09-30' },
    });

    const [allTimeCall, periodCall, topCall] = groupBy.mock.calls.map(
      ([args]) => args,
    );
    expect(allTimeCall.where).toEqual({ userId: 'user-1' });
    expect(periodCall.where).toEqual({
      userId: 'user-1',
      date: {
        gte: new Date('2026-09-01T00:00:00Z'),
        lte: new Date('2026-09-30T00:00:00Z'),
      },
    });
    expect(topCall).toMatchObject({
      where: { userId: 'user-1', type: 'EXPENSE' },
      orderBy: { _sum: { amount: 'desc' } },
      take: 3,
    });
  });

  it('returns zeros and no categories when the user has no transactions', async () => {
    groupBy.mockResolvedValue([]);

    const summary = await service.getSummary('user-1', {});

    expect(summary).toEqual({
      balance: 0,
      totalIncome: 0,
      totalExpense: 0,
      topExpenseCategories: [],
      period: { startDate: null, endDate: null },
    });
    expect(prisma.category.findMany).not.toHaveBeenCalled();
  });
});
