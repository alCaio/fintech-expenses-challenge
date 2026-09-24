import type { PaginationMeta } from '../../types/api'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = meta

  return (
    <nav className="pagination" aria-label="Paginação">
      <span className="muted">
        {total} {total === 1 ? 'registro' : 'registros'}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Próxima
        </button>
      </div>
    </nav>
  )
}
