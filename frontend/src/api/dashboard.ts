import type { ApiResponse } from '../types/api'
import type { DashboardSummary, DateRange } from '../types/domain'
import { api } from './client'

export const dashboardApi = {
  async summary(range: DateRange): Promise<DashboardSummary> {
    const { data } = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary', {
      params: range,
    })
    return data.data
  },
}
