import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "@/utils/storage";
import { Budget, Debt, Payment, Transaction, Wallet } from "@/types";
import { generateId, getTodayString } from "@/utils/dateHelpers";

interface TransferInput {
  amount: number;
  fromWalletId: string;
  toWalletId: string;
  date?: string;
  name?: string;
  note?: string;
}

interface TransferResult {
  ok: boolean;
  error?: string;
}

interface FinanceState {
  wallets: Wallet[];
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  addWallet: (w: Omit<Wallet, "id" | "createdAt">) => void;
  updateWallet: (id: string, partial: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  addTransfer: (transfer: TransferInput) => TransferResult;
  getWalletById: (id: string) => Wallet | undefined;
  deleteTransaction: (id: string) => void;
  getTotalBalance: () => number;
  getMonthlyExpenses: (month: string) => number;
  getMonthlyIncome: (month: string) => number;
  addDebt: (d: Omit<Debt, "id" | "createdAt" | "payments" | "settled">) => void;
  addPayment: (
    debtId: string,
    amount: number,
    options?: { date?: string; transactionId?: string },
  ) => void;
  settleDebt: (id: string) => void;
  deleteDebt: (id: string) => void;
  setBudget: (category: string, limit: number, month: string) => void;
  getBudgetUsage: (
    category: string,
    month: string,
  ) => { spent: number; limit: number; percent: number };
}

const normalizeName = (value?: string) =>
  value?.trim().toLocaleLowerCase("ar-EG") ?? "";

const sumPayments = (payments: Payment[]) =>
  payments.reduce((sum, payment) => sum + payment.amount, 0);

const withSettlement = (debt: Debt): Debt => ({
  ...debt,
  settled:
    debt.totalAmount > 0 && sumPayments(debt.payments) >= debt.totalAmount,
});

const walletDeltaForTransaction = (
  transaction: Transaction,
  walletId: string,
): number => {
  if (transaction.flow === "transfer") {
    if (transaction.walletId === walletId) return -transaction.amount;
    if (transaction.toWalletId === walletId) return transaction.amount;
    return 0;
  }

  if (transaction.walletId !== walletId) return 0;
  return transaction.type === "income"
    ? transaction.amount
    : -transaction.amount;
};

const applyTransactionToWallets = (
  wallets: Wallet[],
  transaction: Transaction,
  multiplier: 1 | -1 = 1,
): Wallet[] =>
  wallets.map((wallet) => ({
    ...wallet,
    balance:
      wallet.balance +
      walletDeltaForTransaction(transaction, wallet.id) * multiplier,
  }));

const findOpenDebt = (
  debts: Debt[],
  personName: string,
  direction: Debt["direction"],
) =>
  debts.find(
    (debt) =>
      !debt.settled &&
      debt.direction === direction &&
      normalizeName(debt.personName) === normalizeName(personName),
  );

const attachDebtForNewTransaction = (
  debts: Debt[],
  transaction: Transaction,
): { debts: Debt[]; debtId?: string; personName?: string } => {
  const personName = transaction.personName?.trim();
  if (!personName) return { debts };

  const direction: Debt["direction"] =
    transaction.type === "expense" ? "owed_to_me" : "i_owe";
  const existing = findOpenDebt(debts, personName, direction);

  if (!existing) {
    const debtId = generateId();
    return {
      debtId,
      personName,
      debts: [
        ...debts,
        {
          id: debtId,
          direction,
          personName,
          totalAmount: transaction.amount,
          payments: [],
          date: transaction.date,
          note: transaction.note,
          settled: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  return {
    debtId: existing.id,
    personName,
    debts: debts.map((debt) =>
      debt.id === existing.id
        ? withSettlement({
            ...debt,
            totalAmount: debt.totalAmount + transaction.amount,
            note: debt.note || transaction.note,
          })
        : debt,
    ),
  };
};

const attachDebtPaymentToTransaction = (
  debts: Debt[],
  transaction: Transaction,
): { debts: Debt[]; personName?: string } => {
  if (!transaction.debtId) return { debts };

  return {
    debts: debts.map((debt) => {
      if (debt.id !== transaction.debtId) return debt;
      const payments: Payment[] = [
        ...debt.payments,
        {
          id: generateId(),
          amount: transaction.amount,
          date: transaction.date,
          transactionId: transaction.id,
        },
      ];
      return withSettlement({ ...debt, payments });
    }),
    personName: debts.find((debt) => debt.id === transaction.debtId)
      ?.personName,
  };
};

const rollbackDebtForTransaction = (
  debts: Debt[],
  transaction: Transaction,
): Debt[] => {
  if (transaction.flow === "debt_new" && transaction.debtId) {
    return debts.flatMap((debt) => {
      if (debt.id !== transaction.debtId) return [debt];

      const paid = sumPayments(debt.payments);
      const nextTotal = Math.max(0, debt.totalAmount - transaction.amount);

      if (nextTotal === 0 && paid === 0) return [];

      return [
        withSettlement({
          ...debt,
          totalAmount: Math.max(nextTotal, paid),
        }),
      ];
    });
  }

  if (transaction.flow === "debt_payment" && transaction.debtId) {
    return debts.map((debt) => {
      if (debt.id !== transaction.debtId) return debt;
      const payments = debt.payments.filter(
        (payment) => payment.transactionId !== transaction.id,
      );
      return withSettlement({ ...debt, payments, settled: false });
    });
  }

  return debts;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      wallets: [],
      transactions: [],
      debts: [],
      budgets: [],
      addWallet: (wallet) =>
        set((state) => ({
          wallets: [
            ...state.wallets,
            {
              ...wallet,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateWallet: (id, partial) =>
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === id ? { ...wallet, ...partial } : wallet,
          ),
        })),
      getWalletById: (id) => get().wallets.find((wallet) => wallet.id === id),
      deleteWallet: (id) =>
        set((state) => ({
          wallets: state.wallets.filter((wallet) => wallet.id !== id),
        })),
      addTransaction: (transactionInput) => {
        const transactionId = generateId();
        const baseTransaction: Transaction = {
          ...transactionInput,
          id: transactionId,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          let nextTransaction = baseTransaction;
          let debts = state.debts;

          if (baseTransaction.flow === "debt_new") {
            const linked = attachDebtForNewTransaction(debts, baseTransaction);
            debts = linked.debts;
            nextTransaction = {
              ...baseTransaction,
              debtId: linked.debtId,
              personName: linked.personName,
            };
          }

          if (baseTransaction.flow === "debt_payment") {
            const linked = attachDebtPaymentToTransaction(
              debts,
              baseTransaction,
            );
            debts = linked.debts;
            nextTransaction = {
              ...baseTransaction,
              personName: linked.personName || baseTransaction.personName,
            };
          }

          return {
            transactions: [...state.transactions, nextTransaction],
            wallets: applyTransactionToWallets(state.wallets, nextTransaction),
            debts,
          };
        });
      },
      addTransfer: ({ amount, fromWalletId, toWalletId, date, name, note }) => {
        if (
          !amount ||
          amount <= 0 ||
          !fromWalletId ||
          !toWalletId ||
          fromWalletId === toWalletId
        )
          return { ok: false, error: "بيانات التحويل غير مكتملة." };
        const sourceWallet = get().wallets.find(
          (wallet) => wallet.id === fromWalletId,
        );
        if (!sourceWallet) {
          return { ok: false, error: "المحفظة المصدر غير موجودة." };
        }
        if (sourceWallet.balance < amount) {
          return {
            ok: false,
            error: `الرصيد الحالي في ${sourceWallet.name} لا يكفي لهذا التحويل.`,
          };
        }
        get().addTransaction({
          type: "expense",
          flow: "transfer",
          amount,
          category: "other",
          name: name?.trim() || "تحويل أموال",
          walletId: fromWalletId,
          toWalletId,
          date: date || getTodayString(),
          note,
        });
        return { ok: true };
      },
      deleteTransaction: (id) =>
        set((state) => {
          const transaction = state.transactions.find((item) => item.id === id);
          if (!transaction) return state;

          return {
            transactions: state.transactions.filter((item) => item.id !== id),
            wallets: applyTransactionToWallets(state.wallets, transaction, -1),
            debts: rollbackDebtForTransaction(state.debts, transaction),
          };
        }),
      getTotalBalance: () =>
        get().wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
      getMonthlyExpenses: (month) =>
        get()
          .transactions.filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.flow !== "transfer" &&
              transaction.date.startsWith(month),
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      getMonthlyIncome: (month) =>
        get()
          .transactions.filter(
            (transaction) =>
              transaction.type === "income" &&
              transaction.flow !== "transfer" &&
              transaction.date.startsWith(month),
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      addDebt: (debt) =>
        set((state) => ({
          debts: [
            ...state.debts,
            {
              ...debt,
              id: generateId(),
              payments: [],
              settled: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      addPayment: (debtId, amount, options) =>
        set((state) => ({
          debts: state.debts.map((debt) => {
            if (debt.id !== debtId) return debt;
            const payments: Payment[] = [
              ...debt.payments,
              {
                id: generateId(),
                amount,
                date: options?.date || getTodayString(),
                transactionId: options?.transactionId,
              },
            ];
            return withSettlement({ ...debt, payments });
          }),
        })),
      settleDebt: (id) =>
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id ? { ...debt, settled: true } : debt,
          ),
        })),
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        })),
      setBudget: (category, limit, month) =>
        set((state) => {
          const exists = state.budgets.find(
            (budget) => budget.category === category && budget.month === month,
          );
          if (exists) {
            return {
              budgets: state.budgets.map((budget) =>
                budget.category === category && budget.month === month
                  ? { ...budget, monthlyLimit: limit }
                  : budget,
              ),
            };
          }

          return {
            budgets: [
              ...state.budgets,
              {
                category: category as Budget["category"],
                monthlyLimit: limit,
                month,
              },
            ],
          };
        }),
      getBudgetUsage: (category, month) => {
        const spent = get()
          .transactions.filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.flow !== "transfer" &&
              transaction.category === category &&
              transaction.date.startsWith(month),
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0);
        const limit =
          get().budgets.find(
            (budget) => budget.category === category && budget.month === month,
          )?.monthlyLimit ?? 0;
        return {
          spent,
          limit,
          percent: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0,
        };
      },
    }),
    { name: "finance-store", storage: createJSONStorage(() => storage) },
  ),
);
