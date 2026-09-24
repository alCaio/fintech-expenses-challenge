import type { Transaction } from '../../types/domain'
import { formatCurrency, formatDate } from '../../utils/format'
import { TRANSACTION_TYPE_LABELS } from './transactionLabels'

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th className="align-right">Valor</th>
            <th className="align-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isExpense = transaction.type === 'EXPENSE'
            return (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category.name}</td>
                <td>
                  <span className={`badge badge-${isExpense ? 'expense' : 'income'}`}>
                    {TRANSACTION_TYPE_LABELS[transaction.type]}
                  </span>
                </td>
                <td className={`align-right amount-${isExpense ? 'negative' : 'positive'}`}>
                  {isExpense ? '−' : '+'} {formatCurrency(transaction.amount)}
                </td>
                <td className="align-right actions">
                  <button type="button" className="btn-link" onClick={() => onEdit(transaction)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => onDelete(transaction)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
