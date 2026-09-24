import type { Category } from '../../types/domain'

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  return (
    <ul className="category-list">
      {categories.map((category) => (
        <li key={category.id} className="category-item">
          <div>
            <strong>{category.name}</strong>
            {category.description && <p className="muted">{category.description}</p>}
          </div>
          <div className="actions">
            <button type="button" className="btn-link" onClick={() => onEdit(category)}>
              Editar
            </button>
            <button type="button" className="btn-link danger" onClick={() => onDelete(category)}>
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
