import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { GradientHeader } from "@/components/ui/GradientHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { WalletCard } from "@/components/finance/WalletCard";
import { TransactionItem } from "@/components/finance/TransactionItem";
import { DebtCard } from "@/components/finance/DebtCard";
import { BudgetCard } from "@/components/finance/BudgetCard";
import { AddWalletSheet } from "@/components/finance/AddWalletSheet";
import { AddTransactionSheet } from "@/components/finance/AddTransactionSheet";
import { AddDebtSheet } from "@/components/finance/AddDebtSheet";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatAmountAr, formatDateAr, getCurrentMonth } from "@/utils/dateHelpers";
import { groupTransactionsByDate } from "@/utils/financialCalc";

type Tab = "wallets" | "transactions" | "debts" | "budget";

export default function FinanceScreen() {
  const [tab, setTab] = useState<Tab>("wallets");
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);

  const {
    wallets,
    transactions,
    debts,
    deleteTransaction,
    getFinanceSummary,
  } = useFinanceStore();

  const month = getCurrentMonth();
  const summary = getFinanceSummary();

  const sections = useMemo(() => {
    const grouped = groupTransactionsByDate([...transactions]);
    return Object.entries(grouped).map(([date, items]) => ({ title: date, data: items }));
  }, [transactions]);

  const openAddByTab = () => {
    if (tab === "wallets") setShowAddWallet(true);
    else if (tab === "transactions") setShowAddTx(true);
    else if (tab === "debts") setShowAddDebt(true);
  };

  const owedToMe = debts.filter((d) => d.direction === "owed_to_me" && !d.settled);
  const iOwe = debts.filter((d) => d.direction === "i_owe" && !d.settled);
  const settled = debts.filter((d) => d.settled);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <GradientHeader
        title="فلوسي 💰"
        subtitle={`رصيد المحافظ: ${formatAmountAr(summary.walletBalance)}`}
        rightAction={{ icon: "add-outline", onPress: openAddByTab }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          marginTop: -24,
          paddingTop: 10,
        }}
      >
        <View style={s.tabRow}>
          {(
            [
              ["wallets", "المحافظ"],
              ["transactions", "المعاملات"],
              ["debts", "الديون"],
              ["budget", "الميزانية"],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key)}
              style={[s.tab, tab === key && s.tabActive]}
            >
              <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "wallets" && (
          <FlatList
            data={wallets}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}
            ListHeaderComponent={
              <AnimatedCard delay={0}>
                <View style={{ gap: 10, marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={[s.summaryCard, { flex: 1 }]}>
                      <Text style={s.summaryLabel}>رصيد المحافظ</Text>
                      <Text style={[s.summaryValue, { color: Colors.textPrimary }]}>
                        {formatAmountAr(summary.walletBalance)}
                      </Text>
                    </View>
                    <View style={[s.summaryCard, { flex: 1 }]}>
                      <Text style={s.summaryLabel}>المتاح للصرف</Text>
                      <Text style={[s.summaryValue, { color: Colors.primary }]}>
                        {formatAmountAr(summary.availableBalance)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={[s.summaryCard, { flex: 1 }]}>
                      <Text style={s.summaryLabel}>لك عند الناس</Text>
                      <Text style={[s.summaryValue, { color: Colors.success }]}>
                        {formatAmountAr(summary.receivables)}
                      </Text>
                    </View>
                    <View style={[s.summaryCard, { flex: 1 }]}>
                      <Text style={s.summaryLabel}>عليك للناس</Text>
                      <Text style={[s.summaryValue, { color: Colors.danger }]}>
                        {formatAmountAr(summary.payables)}
                      </Text>
                    </View>
                  </View>
                  <View style={s.summaryCard}>
                    <Text style={s.summaryLabel}>صافي المركز المالي</Text>
                    <Text
                      style={[
                        s.summaryValue,
                        { color: summary.netPosition >= 0 ? Colors.success : Colors.danger },
                      ]}
                    >
                      {formatAmountAr(summary.netPosition)}
                    </Text>
                  </View>
                  {summary.reservedBalance > 0 && (
                    <View style={s.summaryCard}>
                      <Text style={s.summaryLabel}>إجمالي التحويش المحجوز</Text>
                      <Text style={[s.summaryValue, { color: Colors.primary }]}>
                        {formatAmountAr(summary.reservedBalance)}
                      </Text>
                    </View>
                  )}
                </View>
              </AnimatedCard>
            }
            ListEmptyComponent={
              <EmptyState
                emoji="👛"
                title="مفيش محافظ!"
                subtitle="أضف أول محفظة عشان تبدأ تتابع فلوسك"
                actionLabel="+ أضف محفظة"
                onAction={() => setShowAddWallet(true)}
              />
            }
            renderItem={({ item, index }) => (
              <AnimatedCard delay={Math.min(index * 50, 300)}>
                <WalletCard wallet={item} />
              </AnimatedCard>
            )}
          />
        )}

        {tab === "transactions" && (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
              <EmptyState
                emoji="💸"
                title="مفيش معاملات!"
                subtitle="سجل أول مصروف أو دخل"
                actionLabel="+ أضف معاملة"
                onAction={() => setShowAddTx(true)}
              />
            }
            renderSectionHeader={({ section }) => (
              <Text style={s.dateHeader}>{formatDateAr(section.title)}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionItem transaction={item} onDelete={() => deleteTransaction(item.id)} />
            )}
          />
        )}

        {tab === "debts" && (
          <FlatList
            data={[...owedToMe, ...iOwe, ...settled]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}
            ListEmptyComponent={
              <EmptyState
                emoji="🤝"
                title="مفيش ديون مسجلة"
                subtitle="سجل أول دين ليك أو عليك"
                actionLabel="+ أضف دين"
                onAction={() => setShowAddDebt(true)}
              />
            }
            ListHeaderComponent={
              <View style={{ gap: 8, marginBottom: 6 }}>
                <Text style={s.sectionTitle}>💚 ليك عند الناس</Text>
                {owedToMe.length === 0 && <Text style={s.emptyText}>مفيش ديون ليك دلوقتي</Text>}
                <Text style={[s.sectionTitle, { marginTop: 8 }]}>❤️ عليك للناس</Text>
                {iOwe.length === 0 && <Text style={s.emptyText}>مفيش ديون عليك دلوقتي</Text>}
                {settled.length > 0 && <Text style={[s.sectionTitle, { marginTop: 8 }]}>✅ المسددة</Text>}
              </View>
            }
            renderItem={({ item, index }) => (
              <AnimatedCard delay={Math.min(index * 45, 280)}>
                <DebtCard debt={item} settled={item.settled} />
              </AnimatedCard>
            )}
          />
        )}

        {tab === "budget" && (
          <FlatList
            data={["food", "transport", "shopping", "bills", "entertainment", "education", "health", "other"]}
            keyExtractor={(item) => item}
            contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}
            renderItem={({ item, index }) => (
              <AnimatedCard delay={Math.min(index * 50, 300)}>
                <BudgetCard category={item} month={month} />
              </AnimatedCard>
            )}
          />
        )}
      </View>

      <AddWalletSheet visible={showAddWallet} onClose={() => setShowAddWallet(false)} />
      <AddTransactionSheet visible={showAddTx} onClose={() => setShowAddTx(false)} />
      <AddDebtSheet visible={showAddDebt} onClose={() => setShowAddDebt(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: Colors.primaryXPale,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: { fontFamily: "Cairo-SemiBold", fontSize: 13, color: Colors.textSecondary },
  tabTextActive: { color: "#fff" },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: {
    fontFamily: "Cairo-Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: { fontFamily: "Cairo-Bold", fontSize: 16 },
  dateHeader: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: { fontFamily: "Cairo-Bold", fontSize: 16, color: Colors.textPrimary },
  emptyText: {
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: Colors.textMuted,
    paddingBottom: 6,
  },
});

