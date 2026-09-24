interface SpinnerProps {
  fullPage?: boolean
}

export function Spinner({ fullPage = false }: SpinnerProps) {
  return (
    <div className={fullPage ? 'spinner-page' : 'spinner-inline'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
