import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'
import { useTransactionMutations } from '../../hooks/useTransactions'
import type { Transaction, TransactionInput } from '../../types/domain'
import { Modal } from '../ui/Modal'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/StatusMessage'
import { TransactionForm } from './TransactionForm'

interface TransactionFormModalProps {
  transaction?: Transaction
  onClose: () => void
}

export function TransactionFormModal({ transaction, onClose }: TransactionFormModalProps) {
  const { data: categories, isPending } = useCategories()
  const { create, update } = useTransactionMutations()
  const mutation = transaction ? update : create

  const handleSubmit = (input: TransactionInput) => {
    const payload = { ...input, description: input.description.trim() }
    const options = { onSuccess: onClose }
    if (transaction) {
      update.mutate({ id: transaction.id, input: payload }, options)
    } else {
      create.mutate(payload, options)
    }
  }

  return (
    <Modal title={transaction ? 'Editar transação' : 'Nova transação'} onClose={onClose}>
      {isPending && <Spinner />}
      {categories?.length === 0 && (
        <div className="stack">
          <EmptyState message="Crie uma categoria antes de registrar transações." />
          <Link to="/categories" className="btn btn-primary" onClick={onClose}>
            Ir para categorias
          </Link>
        </div>
      )}
      {categories && categories.length > 0 && (
        <TransactionForm
          categories={categories}
          initial={transaction}
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  )
}
