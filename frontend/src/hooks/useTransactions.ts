import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '../api/errors'
import { transactionsApi } from '../api/transactions'
import type { TransactionFilters, TransactionInput } from '../types/domain'
import { queryKeys } from './queryKeys'

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactionList(filters),
    queryFn: () => transactionsApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useTransactionMutations() {
  const queryClient = useQueryClient()

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ])
  }

  const onError = (error: unknown): void => {
    toast.error(getErrorMessage(error))
  }

  const create = useMutation({
    mutationFn: (input: TransactionInput) => transactionsApi.create(input),
    onSuccess: async () => {
      toast.success('Transação criada')
      await invalidate()
    },
    onError,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      transactionsApi.update(id, input),
    onSuccess: async () => {
      toast.success('Transação atualizada')
      await invalidate()
    },
    onError,
  })

  const remove = useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: async () => {
      toast.success('Transação excluída')
      await invalidate()
    },
    onError,
  })

  return { create, update, remove }
}
