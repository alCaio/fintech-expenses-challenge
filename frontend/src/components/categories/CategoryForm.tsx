import { useForm } from 'react-hook-form'
import type { Category, CategoryInput } from '../../types/domain'
import { FormField } from '../ui/FormField'

interface CategoryFormValues {
  name: string
  description: string
}

interface CategoryFormProps {
  initial?: Category
  isSubmitting: boolean
  onSubmit: (input: CategoryInput) => void
  onCancel: () => void
}

export function CategoryForm({ initial, isSubmitting, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: { name: initial?.name ?? '', description: initial?.description ?? '' },
  })

  const submit = (values: CategoryFormValues) =>
    onSubmit({ name: values.name.trim(), description: values.description.trim() || null })

  return (
    <form className="form" onSubmit={handleSubmit(submit)} noValidate>
      <FormField label="Nome" htmlFor="category-name" error={errors.name?.message}>
        <input
          id="category-name"
          placeholder="Ex.: Alimentação"
          {...register('name', {
            validate: (value) => value.trim().length > 0 || 'Informe o nome',
            maxLength: { value: 60, message: 'Máximo de 60 caracteres' },
          })}
        />
      </FormField>
      <FormField
        label="Descrição (opcional)"
        htmlFor="category-description"
        error={errors.description?.message}
      >
        <textarea
          id="category-description"
          rows={3}
          {...register('description', {
            maxLength: { value: 255, message: 'Máximo de 255 caracteres' },
          })}
        />
      </FormField>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
