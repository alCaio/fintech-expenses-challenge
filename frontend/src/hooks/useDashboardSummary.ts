import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import type { DateRange } from '../types/domain'
import { queryKeys } from './queryKeys'

export function useDashboardSummary(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(range),
    queryFn: () => dashboardApi.summary(range),
    placeholderData: keepPreviousData,
  })
}
