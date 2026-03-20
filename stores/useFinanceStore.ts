import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '../utils/storage'
import { Wallet, Transaction, Debt, Budget, Payment } from '../types'
import { generateId } from '../utils/dateHelpers'

interface FinanceState {
  wallets: Wallet[]
  transactions: Transaction[]
  debts: Debt[]
  budgets: Budget[]
  addWallet: (w: Omit<Wallet, 'id' | 'createdAt'>) => void
  updateWallet: (id: string, partial: Partial<Wallet>) => void
  deleteWallet: (id: string) => void
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  deleteTransaction: (id: string) => void
  getTotalBalance: () => number
  getMonthlyExpenses: (month: string) => number
  getMonthlyIncome: (month: string) => number
  addDebt: (d: Omit<Debt, 'id' | 'createdAt' | 'payments' | 'settled'>) => void
  addPayment: (debtId: string, amount: number) => void
  settleDebt: (id: string) => void
  deleteDebt: (id: string) => void
  setBudget: (category: string, limit: number, month: string) => void
  getBudgetUsage: (category: string, month: string) => { spent: number; limit: number; percent: number }
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      wallets: [], transactions: [], debts: [], budgets: [],
      addWallet: (w) => set((s) => ({ wallets: [...s.wallets, { ...w, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateWallet: (id, partial) => set((s) => ({ wallets: s.wallets.map((w) => w.id === id ? { ...w, ...partial } : w) })),
      deleteWallet: (id) => set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) })),
      addTransaction: (t) => {
        const id = generateId()
        set((s) => {
          const newT = { ...t, id, createdAt: new Date().toISOString() }
          const wallets = s.wallets.map((w) => {
            if (w.id !== t.walletId) return w
            return { ...w, balance: w.balance + (t.type === 'income' ? t.amount : -t.amount) }
          })
          return { transactions: [...s.transactions, newT], wallets }
        })
      },
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      getTotalBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),
      getMonthlyExpenses: (month) => get().transactions.filter((t) => t.type === 'expense' && t.date.startsWith(month)).reduce((sum, t) => sum + t.amount, 0),
      getMonthlyIncome: (month) => get().transactions.filter((t) => t.type === 'income' && t.date.startsWith(month)).reduce((sum, t) => sum + t.amount, 0),
      addDebt: (d) => set((s) => ({ debts: [...s.debts, { ...d, id: generateId(), payments: [], settled: false, createdAt: new Date().toISOString() }] })),
      addPayment: (debtId, amount) => set((s) => ({
        debts: s.debts.map((d) => {
          if (d.id !== debtId) return d
          const payments: Payment[] = [...d.payments, { id: generateId(), amount, date: new Date().toISOString() }]
          return { ...d, payments, settled: payments.reduce((sum, p) => sum + p.amount, 0) >= d.totalAmount }
        }),
      })),
      settleDebt: (id) => set((s) => ({ debts: s.debts.map((d) => d.id === id ? { ...d, settled: true } : d) })),
      deleteDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),
      setBudget: (category, limit, month) => set((s) => {
        const exists = s.budgets.find((b) => b.category === category && b.month === month)
        if (exists) return { budgets: s.budgets.map((b) => b.category === category && b.month === month ? { ...b, monthlyLimit: limit } : b) }
        return { budgets: [...s.budgets, { category: category as any, monthlyLimit: limit, month }] }
      }),
      getBudgetUsage: (category, month) => {
        const spent = get().transactions.filter((t) => t.type === 'expense' && t.category === category && t.date.startsWith(month)).reduce((sum, t) => sum + t.amount, 0)
        const limit = get().budgets.find((b) => b.category === category && b.month === month)?.monthlyLimit ?? 0
        return { spent, limit, percent: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0 }
      },
    }),
    { name: 'finance-store', storage: createJSONStorage(() => storage) },
  ),
)
