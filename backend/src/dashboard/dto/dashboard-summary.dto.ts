export class TopExpenseCategoryDto {
  categoryId!: string;
  name!: string;
  total!: number;
}

export class DashboardPeriodDto {
  startDate!: string | null;
  endDate!: string | null;
}

export class DashboardSummaryDto {
  balance!: number;
  totalIncome!: number;
  totalExpense!: number;
  topExpenseCategories!: TopExpenseCategoryDto[];
  period!: DashboardPeriodDto;
}
