import { useState } from 'react'
import { TransactionFiltersBar } from '../components/transactions/TransactionFiltersBar'
import { TransactionFormModal } from '../components/transactions/TransactionFormModal'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState, ErrorState } from '../components/ui/StatusMessage'
import { useCategories } from '../hooks/useCategories'
import { useTransactionFilters } from '../hooks/useTransactionFilters'
import { useTransactionMutations, useTransactions } from '../hooks/useTransactions'
import type { Transaction } from '../types/domain'

type FormState = { mode: 'create' } | { mode: 'edit'; transaction: Transaction } | null

export function TransactionsPage() {
  const { filters, setFilters, setPage } = useTransactionFilters()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useTransactions(filters)
  const { data: categories = [] } = useCategories()
  const { remove } = useTransactionMutations()

  const [formState, setFormState] = useState<FormState>(null)
  const [toDelete, setToDelete] = useState<Transaction | null>(null)

  const closeForm = () => setFormState(null)

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null)
        if (data?.data.length === 1 && filters.page > 1) setPage(filters.page - 1)
      },
    })
  }

  const { page: _page, limit: _limit, ...editableFilters } = filters

  return (
    <>
      <div className="page-header">
        <h1>Transações</h1>
        <button type="button" className="btn btn-primary" onClick={() => setFormState({ mode: 'create' })}>
          Nova transação
        </button>
      </div>

      <TransactionFiltersBar value={editableFilters} categories={categories} onChange={setFilters} />

      <section className="card" aria-busy={isPlaceholderData}>
        {isPending && <Spinner />}
        {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
        {data && data.data.length === 0 && (
          <EmptyState message="Nenhuma transação encontrada para os filtros selecionados." />
        )}
        {data && data.data.length > 0 && (
          <>
            <TransactionTable
              transactions={data.data}
              onEdit={(transaction) => setFormState({ mode: 'edit', transaction })}
              onDelete={setToDelete}
            />
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </section>

      {formState && (
        <TransactionFormModal
          transaction={formState.mode === 'edit' ? formState.transaction : undefined}
          onClose={closeForm}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Excluir transação"
          message={`Deseja excluir "${toDelete.description}"? Esta ação não pode ser desfeita.`}
          isPending={remove.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}
