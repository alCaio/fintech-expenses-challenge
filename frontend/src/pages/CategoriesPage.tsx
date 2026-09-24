import { useState } from 'react'
import { CategoryForm } from '../components/categories/CategoryForm'
import { CategoryList } from '../components/categories/CategoryList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState, ErrorState } from '../components/ui/StatusMessage'
import { useCategories, useCategoryMutations } from '../hooks/useCategories'
import type { Category, CategoryInput } from '../types/domain'

type FormState = { mode: 'create' } | { mode: 'edit'; category: Category } | null

export function CategoriesPage() {
  const { data: categories, isPending, isError, error, refetch } = useCategories()
  const { create, update, remove } = useCategoryMutations()
  const [formState, setFormState] = useState<FormState>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const closeForm = () => setFormState(null)

  const handleSubmit = (input: CategoryInput) => {
    const options = { onSuccess: closeForm }
    if (formState?.mode === 'edit') {
      update.mutate({ id: formState.category.id, input }, options)
    } else {
      create.mutate(input, options)
    }
  }

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })
  }

  return (
    <>
      <div className="page-header">
        <h1>Categorias</h1>
        <button type="button" className="btn btn-primary" onClick={() => setFormState({ mode: 'create' })}>
          Nova categoria
        </button>
      </div>

      <section className="card">
        {isPending && <Spinner />}
        {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
        {categories?.length === 0 && (
          <EmptyState message="Nenhuma categoria cadastrada. Crie a primeira para registrar transações." />
        )}
        {categories && categories.length > 0 && (
          <CategoryList categories={categories} onEdit={(category) => setFormState({ mode: 'edit', category })} onDelete={setToDelete} />
        )}
      </section>

      {formState && (
        <Modal title={formState.mode === 'edit' ? 'Editar categoria' : 'Nova categoria'} onClose={closeForm}>
          <CategoryForm
            initial={formState.mode === 'edit' ? formState.category : undefined}
            isSubmitting={create.isPending || update.isPending}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Excluir categoria"
          message={`Deseja excluir "${toDelete.name}"? Categorias com transações não podem ser excluídas.`}
          isPending={remove.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}
