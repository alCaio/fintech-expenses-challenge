import { TransactionType, type Category, type TransactionFilters } from '../../types/domain'
import { TRANSACTION_TYPE_LABELS } from './transactionLabels'

type EditableFilters = Omit<TransactionFilters, 'page' | 'limit'>

interface TransactionFiltersBarProps {
  value: EditableFilters
  categories: Category[]
  onChange: (filters: EditableFilters) => void
}

export function TransactionFiltersBar({ value, categories, onChange }: TransactionFiltersBarProps) {
  const update = (patch: Partial<EditableFilters>) => onChange({ ...value, ...patch })
  const hasFilters = Boolean(value.type || value.categoryId || value.startDate || value.endDate)

  return (
    <div className="card filters">
      <label>
        Tipo
        <select
          value={value.type ?? ''}
          onChange={(event) =>
            update({ type: (event.target.value || undefined) as TransactionType | undefined })
          }
        >
          <option value="">Todos</option>
          {Object.values(TransactionType).map((type) => (
            <option key={type} value={type}>
              {TRANSACTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Categoria
        <select
          value={value.categoryId ?? ''}
          onChange={(event) => update({ categoryId: event.target.value || undefined })}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        De
        <input
          type="date"
          value={value.startDate ?? ''}
          max={value.endDate}
          onChange={(event) => update({ startDate: event.target.value || undefined })}
        />
      </label>
      <label>
        Até
        <input
          type="date"
          value={value.endDate ?? ''}
          min={value.startDate}
          onChange={(event) => update({ endDate: event.target.value || undefined })}
        />
      </label>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onChange({})}
        disabled={!hasFilters}
      >
        Limpar filtros
      </button>
    </div>
  )
}
