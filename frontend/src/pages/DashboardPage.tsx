import { useState } from 'react'
import { PeriodSelector } from '../components/dashboard/PeriodSelector'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { TopExpenseCategories } from '../components/dashboard/TopExpenseCategories'
import { Spinner } from '../components/ui/Spinner'
import { ErrorState } from '../components/ui/StatusMessage'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import type { DateRange } from '../types/domain'
import { currentMonthRange } from '../utils/format'

export function DashboardPage() {
  const [range, setRange] = useState<DateRange>(currentMonthRange)
  const { data, isPending, isError, error, refetch } = useDashboardSummary(range)

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <PeriodSelector value={range} onChange={setRange} />
      </div>

      {isPending && <Spinner />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
      {data && (
        <div className="stack">
          <SummaryCards summary={data} />
          <TopExpenseCategories
            categories={data.topExpenseCategories}
            totalExpense={data.totalExpense}
          />
        </div>
      )}
    </>
  )
}
