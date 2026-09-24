export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type CategoryInput = Pick<Category, 'name'> & {
  description?: string | null
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: string
  category: Pick<Category, 'id' | 'name'>
  createdAt: string
  updatedAt: string
}

export type TransactionInput = Pick<
  Transaction,
  'description' | 'amount' | 'type' | 'date'
> & {
  categoryId: string
}

export interface DateRange {
  startDate?: string
  endDate?: string
}

export interface TransactionFilters extends DateRange {
  type?: TransactionType
  categoryId?: string
  page: number
  limit: number
}

export interface TopExpenseCategory {
  categoryId: string
  name: string
  total: number
}

export interface DashboardSummary {
  balance: number
  totalIncome: number
  totalExpense: number
  topExpenseCategories: TopExpenseCategory[]
  period: { startDate: string | null; endDate: string | null }
}
