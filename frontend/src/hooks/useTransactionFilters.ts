import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TransactionType, type TransactionFilters } from '../types/domain'

const DEFAULT_LIMIT = 10

type EditableFilters = Omit<TransactionFilters, 'page' | 'limit'>

function parseType(value: string | null): TransactionType | undefined {
  return value === TransactionType.INCOME || value === TransactionType.EXPENSE
    ? value
    : undefined
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<TransactionFilters>(
    () => ({
      type: parseType(searchParams.get('type')),
      categoryId: searchParams.get('categoryId') ?? undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      page: parsePage(searchParams.get('page')),
      limit: DEFAULT_LIMIT,
    }),
    [searchParams],
  )

  const setFilters = useCallback(
    (next: EditableFilters) => {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, String(value))
      }
      setSearchParams(params)
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((current) => {
        const params = new URLSearchParams(current)
        params.set('page', String(page))
        return params
      })
    },
    [setSearchParams],
  )

  return { filters, setFilters, setPage }
}
