import { Debt, Transaction } from '@/types'
import { parseDateString } from '@/utils/dateHelpers'

export const calcDebtRemaining = (debt: Debt): number => {
  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0)
  return Math.max(0, debt.totalAmount - paid)
}

export const calcDebtPercent = (debt: Debt): number => {
  if (debt.totalAmount <= 0) return 100
  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0)
  return Math.min((paid / debt.totalAmount) * 100, 100)
}

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {}
  transactions
    .sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime())
    .forEach((t) => {
      const key = t.date
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
  return groups
}
