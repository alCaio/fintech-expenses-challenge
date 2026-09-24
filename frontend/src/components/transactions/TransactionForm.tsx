import { useForm } from 'react-hook-form'
import {
  TransactionType,
  type Category,
  type Transaction,
  type TransactionInput,
} from '../../types/domain'
import { toIsoDate } from '../../utils/format'
import { FormField } from '../ui/FormField'
import { TRANSACTION_TYPE_LABELS } from './transactionLabels'

interface TransactionFormProps {
  categories: Category[]
  initial?: Transaction
  isSubmitting: boolean
  onSubmit: (input: TransactionInput) => void
  onCancel: () => void
}

function toFormValues(transaction?: Transaction): TransactionInput {
  if (!transaction) {
    return {
      description: '',
      amount: Number.NaN,
      type: TransactionType.EXPENSE,
      date: toIsoDate(new Date()),
      categoryId: '',
    }
  }
  return {
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.date,
    categoryId: transaction.category.id,
  }
}

export function TransactionForm({
  categories,
  initial,
  isSubmitting,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionInput>({ defaultValues: toFormValues(initial) })

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
        <input
          id="description"
          {...register('description', {
            required: 'Informe a descrição',
            maxLength: { value: 255, message: 'Máximo de 255 caracteres' },
            validate: (value) => value.trim().length > 0 || 'Informe a descrição',
          })}
        />
      </FormField>

      <div className="form-row">
        <FormField label="Valor (R$)" htmlFor="amount" error={errors.amount?.message}>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            {...register('amount', {
              valueAsNumber: true,
              validate: (value) => {
                if (Number.isNaN(value)) return 'Informe o valor'
                if (value <= 0) return 'O valor deve ser maior que zero'
                if (Math.round(value * 100) !== value * 100) return 'Use no máximo 2 casas decimais'
                return true
              },
            })}
          />
        </FormField>
        <FormField label="Data" htmlFor="date" error={errors.date?.message}>
          <input id="date" type="date" {...register('date', { required: 'Informe a data' })} />
        </FormField>
      </div>

      <div className="form-row">
        <FormField label="Tipo" htmlFor="type">
          <select id="type" {...register('type')}>
            {Object.values(TransactionType).map((type) => (
              <option key={type} value={type}>
                {TRANSACTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Categoria" htmlFor="categoryId" error={errors.categoryId?.message}>
          <select id="categoryId" {...register('categoryId', { required: 'Selecione a categoria' })}>
            <option value="">Selecione...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

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
