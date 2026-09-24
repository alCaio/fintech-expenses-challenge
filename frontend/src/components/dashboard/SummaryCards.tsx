import type { DashboardSummary } from '../../types/domain'
import { formatCurrency } from '../../utils/format'

interface SummaryCardsProps {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Saldo atual',
      hint: 'Todas as transações',
      value: summary.balance,
      tone: summary.balance >= 0 ? 'positive' : 'negative',
    },
    { label: 'Entradas', hint: 'No período', value: summary.totalIncome, tone: 'positive' },
    { label: 'Saídas', hint: 'No período', value: summary.totalExpense, tone: 'negative' },
  ] as const

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <section key={card.label} className="card summary-card">
          <span className="muted">{card.label}</span>
          <strong className={`amount amount-${card.tone}`}>{formatCurrency(card.value)}</strong>
          <small className="muted">{card.hint}</small>
        </section>
      ))}
    </div>
  )
}
