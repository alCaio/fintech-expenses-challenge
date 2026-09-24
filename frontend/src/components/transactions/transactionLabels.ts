import type { TransactionType } from '../../types/domain'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saída',
}
