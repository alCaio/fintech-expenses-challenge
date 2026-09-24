import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { DateRangeQueryDto } from '../common/dto/date-range-query.dto';
import { toDateRangeFilter } from '../common/utils/date-range.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardSummaryDto,
  TopExpenseCategoryDto,
} from './dto/dashboard-summary.dto';

const TOP_CATEGORIES_LIMIT = 3;

type TotalsByType = Record<TransactionType, Prisma.Decimal>;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    userId: string,
    query: DateRangeQueryDto,
  ): Promise<DashboardSummaryDto> {
    const periodWhere: Prisma.TransactionWhereInput = {
      userId,
      date: toDateRangeFilter(query),
    };

    const [allTime, inPeriod, topExpenseCategories] = await Promise.all([
      this.sumByType({ userId }),
      this.sumByType(periodWhere),
      this.topExpenseCategories(periodWhere),
    ]);

    return {
      balance: allTime.INCOME.minus(allTime.EXPENSE).toNumber(),
      totalIncome: inPeriod.INCOME.toNumber(),
      totalExpense: inPeriod.EXPENSE.toNumber(),
      topExpenseCategories,
      period: {
        startDate: query.startDate ?? null,
        endDate: query.endDate ?? null,
      },
    };
  }

  private async sumByType(
    where: Prisma.TransactionWhereInput,
  ): Promise<TotalsByType> {
    const groups = await this.prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });

    const totals: TotalsByType = {
      INCOME: new Prisma.Decimal(0),
      EXPENSE: new Prisma.Decimal(0),
    };
    for (const group of groups) {
      totals[group.type] = group._sum.amount ?? new Prisma.Decimal(0);
    }
    return totals;
  }

  private async topExpenseCategories(
    where: Prisma.TransactionWhereInput,
  ): Promise<TopExpenseCategoryDto[]> {
    const groups = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...where, type: TransactionType.EXPENSE },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: TOP_CATEGORIES_LIMIT,
    });
    if (groups.length === 0) {
      return [];
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: groups.map((group) => group.categoryId) } },
      select: { id: true, name: true },
    });
    const namesById = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    return groups.map((group) => ({
      categoryId: group.categoryId,
      name: namesById.get(group.categoryId) ?? '',
      total: (group._sum.amount ?? new Prisma.Decimal(0)).toNumber(),
    }));
  }
}
