import type { ApiResponse, PaginatedResponse } from '../types/api'
import type { Transaction, TransactionFilters, TransactionInput } from '../types/domain'
import { api } from './client'

export const transactionsApi = {
  async list(filters: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: filters,
    })
    return data
  },

  async create(input: TransactionInput): Promise<Transaction> {
    const { data } = await api.post<ApiResponse<Transaction>>('/transactions', input)
    return data.data
  },

  async update(id: string, input: Partial<TransactionInput>): Promise<Transaction> {
    const { data } = await api.patch<ApiResponse<Transaction>>(`/transactions/${id}`, input)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },
}
