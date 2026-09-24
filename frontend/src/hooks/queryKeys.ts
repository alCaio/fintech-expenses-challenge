import type { DateRange, TransactionFilters } from '../types/domain'

export const queryKeys = {
  categories: ['categories'] as const,
  transactions: ['transactions'] as const,
  transactionList: (filters: TransactionFilters) => ['transactions', filters] as const,
  dashboard: ['dashboard'] as const,
  dashboardSummary: (range: DateRange) => ['dashboard', range] as const,
}
