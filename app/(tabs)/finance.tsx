import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { GradientHeader } from '@/components/ui/GradientHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { WalletCard } from '@/components/finance/WalletCard'
import { TransactionItem } from '@/components/finance/TransactionItem'
import { DebtCard } from '@/components/finance/DebtCard'
import { BudgetCard } from '@/components/finance/BudgetCard'
import { AddWalletSheet } from '@/components/finance/AddWalletSheet'
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet'
import { AddDebtSheet } from '@/components/finance/AddDebtSheet'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { formatAmountAr, getCurrentMonth } from '@/utils/dateHelpers'
import { groupTransactionsByDate } from '@/utils/financialCalc'

type Tab = 'wallets' | 'transactions' | 'debts' | 'budget'

export default function FinanceScreen() {
  const [tab, setTab] = useState<Tab>('wallets')
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showAddDebt, setShowAddDebt] = useState(false)

  const {
    wallets,
    transactions,
    debts,
    budgets,
    getTotalBalance,
    getMonthlyExpenses,
    getMonthlyIncome,
    deleteTransaction,
    getBudgetUsage,
  } = useFinanceStore()

  const month = getCurrentMonth()
  const grouped = groupTransactionsByDate([...transactions])

  const getAddAction = () => {
    if (tab === 'wallets') setShowAddWallet(true)
    else if (tab === 'transactions') setShowAddTx(true)
    else if (tab === 'debts') setShowAddDebt(true)
  }

  void budgets
  void getBudgetUsage

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['bottom']}>
      <GradientHeader
        title="فلوسي 💰"
        subtitle={`إجمالي: ${formatAmountAr(getTotalBalance())}`}
        rightAction={{ icon: 'add-outline', onPress: getAddAction }}
      />

      <View style={{ flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -24, paddingTop: 10 }}>
        <View style={s.tabRow}>
          {([['wallets', 'المحافظ'], ['transactions', 'المعاملات'], ['debts', 'الديون'], ['budget', 'الميزانية']] as const).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => setTab(key)} style={[s.tab, tab === key && s.tabActive]}>
              <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'wallets' && (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <AnimatedCard delay={0}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
                {[
                  { label: 'دخل الشهر', value: getMonthlyIncome(month), color: Colors.success },
                  { label: 'مصروف الشهر', value: getMonthlyExpenses(month), color: Colors.danger },
                ].map((item) => (
                  <View key={item.label} style={[s.summaryCard, { flex: 1 }]}>
                    <Text style={s.summaryLabel}>{item.label}</Text>
                    <Text style={[s.summaryValue, { color: item.color }]}>
                      {formatAmountAr(item.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </AnimatedCard>

            {wallets.length === 0
              ? (
                  <EmptyState
                    emoji="👛"
                    title="مفيش محافظ!"
                    subtitle="أضف أول محفظة عشان تبدأ تتابع فلوسك"
                    actionLabel="+ أضف محفظة"
                    onAction={() => setShowAddWallet(true)}
                  />
                )
              : wallets.map((w, i) => (
                  <AnimatedCard key={w.id} delay={Math.min(i * 70, 350)}>
                    <WalletCard wallet={w} />
                  </AnimatedCard>
                ))}
          </ScrollView>
        )}

        {tab === 'transactions' && (
          transactions.length === 0
            ? (
                <EmptyState
                  emoji="💸"
                  title="مفيش معاملات!"
                  subtitle="سجل أول مصروف أو دخل"
                  actionLabel="+ أضف معاملة"
                  onAction={() => setShowAddTx(true)}
                />
              )
            : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                  {Object.entries(grouped).map(([date, txs]) => (
                    <View key={date} style={{ marginBottom: 16 }}>
                      <Text style={s.dateHeader}>{date}</Text>
                      {txs.map((tx) => (
                        <TransactionItem key={tx.id} transaction={tx} onDelete={() => deleteTransaction(tx.id)} />
                      ))}
                    </View>
                  ))}
                </ScrollView>
              )
        )}

        {tab === 'debts' && (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <Text style={s.sectionTitle}>💚 ليك عند الناس</Text>
            {debts.filter((d) => d.direction === 'owed_to_me' && !d.settled).length === 0
              ? <Text style={s.emptyText}>مفيش ديون ليك دلوقتي</Text>
              : debts.filter((d) => d.direction === 'owed_to_me' && !d.settled).map((d, i) => (
                  <AnimatedCard key={d.id} delay={Math.min(i * 65, 350)}>
                    <DebtCard debt={d} />
                  </AnimatedCard>
                ))}

            <Text style={[s.sectionTitle, { marginTop: 16 }]}>❤️ عليك للناس</Text>
            {debts.filter((d) => d.direction === 'i_owe' && !d.settled).length === 0
              ? <Text style={s.emptyText}>مفيش ديون عليك دلوقتي</Text>
              : debts.filter((d) => d.direction === 'i_owe' && !d.settled).map((d, i) => (
                  <AnimatedCard key={d.id} delay={Math.min((i + 2) * 65, 350)}>
                    <DebtCard debt={d} />
                  </AnimatedCard>
                ))}

            {debts.filter((d) => d.settled).length > 0 && (
              <>
                <Text style={[s.sectionTitle, { marginTop: 16 }]}>✅ المسددة</Text>
                {debts.filter((d) => d.settled).map((d, i) => (
                  <AnimatedCard key={d.id} delay={Math.min(i * 65, 350)}>
                    <DebtCard debt={d} settled />
                  </AnimatedCard>
                ))}
              </>
            )}
          </ScrollView>
        )}

        {tab === 'budget' && (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            {['food', 'transport', 'shopping', 'bills', 'entertainment', 'education', 'health', 'other'].map((cat, i) => (
              <AnimatedCard key={cat} delay={Math.min(i * 65, 350)}>
                <BudgetCard category={cat} month={month} />
              </AnimatedCard>
            ))}
          </ScrollView>
        )}
      </View>

      <AddWalletSheet visible={showAddWallet} onClose={() => setShowAddWallet(false)} />
      <AddTransactionSheet visible={showAddTx} onClose={() => setShowAddTx(false)} />
      <AddDebtSheet visible={showAddDebt} onClose={() => setShowAddDebt(false)} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: Colors.primaryXPale, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: Colors.borderLight },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  tabText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border },
  summaryLabel: { fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontFamily: 'Cairo-Bold', fontSize: 16 },
  dateHeader: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: Colors.textPrimary },
  emptyText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: 12 },
})
