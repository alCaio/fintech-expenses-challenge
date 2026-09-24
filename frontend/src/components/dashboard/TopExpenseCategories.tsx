import type { TopExpenseCategory } from '../../types/domain'
import { formatCurrency } from '../../utils/format'
import { EmptyState } from '../ui/StatusMessage'

interface TopExpenseCategoriesProps {
  categories: TopExpenseCategory[]
  totalExpense: number
}

export function TopExpenseCategories({ categories, totalExpense }: TopExpenseCategoriesProps) {
  return (
    <section className="card">
      <h2>Categorias com mais saídas</h2>
      {categories.length === 0 ? (
        <EmptyState message="Nenhuma saída no período." />
      ) : (
        <ol className="top-list">
          {categories.map((category) => {
            const share = totalExpense > 0 ? (category.total / totalExpense) * 100 : 0
            return (
              <li key={category.categoryId}>
                <div className="top-list-row">
                  <span>{category.name}</span>
                  <strong>{formatCurrency(category.total)}</strong>
                </div>
                <div className="bar" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${share}%` }} />
                </div>
                <small className="muted">{share.toFixed(1)}% das saídas</small>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
