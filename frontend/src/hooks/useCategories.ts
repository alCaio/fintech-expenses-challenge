import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoriesApi } from '../api/categories'
import { getErrorMessage } from '../api/errors'
import type { CategoryInput } from '../types/domain'
import { queryKeys } from './queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.list,
  })
}

export function useCategoryMutations() {
  const queryClient = useQueryClient()

  const invalidate = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ])
  }

  const onError = (error: unknown): void => {
    toast.error(getErrorMessage(error))
  }

  const create = useMutation({
    mutationFn: (input: CategoryInput) => categoriesApi.create(input),
    onSuccess: async () => {
      toast.success('Categoria criada')
      await invalidate()
    },
    onError,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      categoriesApi.update(id, input),
    onSuccess: async () => {
      toast.success('Categoria atualizada')
      await invalidate()
    },
    onError,
  })

  const remove = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: async () => {
      toast.success('Categoria excluída')
      await invalidate()
    },
    onError,
  })

  return { create, update, remove }
}
