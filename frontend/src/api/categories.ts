import type { ApiResponse } from '../types/api'
import type { Category, CategoryInput } from '../types/domain'
import { api } from './client'

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories')
    return data.data
  },

  async create(input: CategoryInput): Promise<Category> {
    const { data } = await api.post<ApiResponse<Category>>('/categories', input)
    return data.data
  },

  async update(id: string, input: Partial<CategoryInput>): Promise<Category> {
    const { data } = await api.patch<ApiResponse<Category>>(`/categories/${id}`, input)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
