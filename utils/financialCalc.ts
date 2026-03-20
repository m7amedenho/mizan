import { Transaction, Debt } from '@/types'

export const calcDebtRemaining = (debt: Debt): number => {
  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0)
  return Math.max(0, debt.totalAmount - paid)
}

export const calcDebtPercent = (debt: Debt): number => {
  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0)
  return Math.min((paid / debt.totalAmount) * 100, 100)
}

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {}
  transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach((t) => {
      const key = t.date.split('T')[0]
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
  return groups
}
