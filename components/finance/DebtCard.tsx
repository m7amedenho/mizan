import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Debt } from "@/types";
import { Colors } from "@/constants/colors";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { calcDebtRemaining, calcDebtPercent } from "@/utils/financialCalc";
import { formatAmountAr, getDayLabel, getTodayString } from "@/utils/dateHelpers";
import { useFinanceStore } from "@/stores/useFinanceStore";

export function DebtCard({ debt, settled }: { debt: Debt; settled?: boolean }) {
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletImpactMode, setWalletImpactMode] = useState<"affect_wallet" | "record_only">(
    "affect_wallet",
  );
  const [walletId, setWalletId] = useState("");
  const { settleDebt, wallets, addPayment, addTransaction, getWalletAvailableBalance } = useFinanceStore();

  const remaining = calcDebtRemaining(debt);
  const percent = calcDebtPercent(debt);
  const color = debt.direction === "owed_to_me" ? Colors.success : Colors.danger;
  const txType = useMemo(() => (debt.direction === "owed_to_me" ? "income" : "expense"), [debt.direction]);

  const handlePay = () => {
    const val = Number.parseFloat(amount);
    if (!val || val <= 0) return;

    if (walletImpactMode === "record_only") {
      addPayment(debt.id, val, { date: getTodayString() });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAmount("");
      setShowPayment(false);
      return;
    }

    if (!walletId) return;
    if (txType === "expense" && getWalletAvailableBalance(walletId) < val) {
      Alert.alert("الرصيد غير كافٍ", "المبلغ أكبر من المتاح بعد خصم التحويش.");
      return;
    }

    const result = addTransaction({
      type: txType,
      flow: "debt_payment",
      amount: val,
      category: "other",
      name: txType === "income" ? `تحصيل من ${debt.personName}` : `سداد إلى ${debt.personName}`,
      walletId,
      date: getTodayString(),
      debtId: debt.id,
      personName: debt.personName,
      walletImpactMode,
    });

    if (!result.ok) {
      Alert.alert("تعذر التسجيل", result.error || "حدثت مشكلة أثناء تسجيل الدفعة.");
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAmount("");
    setWalletId("");
    setShowPayment(false);
  };

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: settled ? Colors.borderLight : `${color}40`,
        opacity: settled ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${color}20`,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 10,
          }}
        >
          <Text style={{ fontSize: 20 }}>{debt.direction === "owed_to_me" ? "👤" : "🤝"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Cairo-Bold", fontSize: 15, color: Colors.textPrimary }}>
            {debt.contactNameSnapshot || debt.personName}
          </Text>
          <Text style={{ fontFamily: "Cairo-Regular", fontSize: 12, color: Colors.textSecondary }}>
            إجمالي: {formatAmountAr(debt.totalAmount)}
          </Text>
        </View>
        <Text style={{ fontFamily: "Cairo-Bold", fontSize: 16, color }}>
          {formatAmountAr(remaining)}
        </Text>
      </View>

      <ProgressBar percent={percent} color={color} height={6} />

      {debt.note && (
        <Text style={{ fontFamily: "Cairo-Regular", fontSize: 12, color: Colors.textMuted, marginTop: 8 }}>
          {debt.note}
        </Text>
      )}

      {debt.payments.length > 0 && (
        <View style={{ marginTop: 10, gap: 6 }}>
          {debt.payments.slice(-3).reverse().map((payment) => (
            <View
              key={payment.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: Colors.background,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 12, color: Colors.textPrimary }}>
                  {formatAmountAr(payment.amount)}
                </Text>
                {payment.transactionId && (
                  <View
                    style={{
                      backgroundColor: Colors.primaryPale,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 10, color: Colors.primary }}>
                      من معاملة
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontFamily: "Cairo-Regular", fontSize: 11, color: Colors.textMuted }}>
                {getDayLabel(payment.date)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {!settled && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => setShowPayment(true)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: `${color}15`,
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 13, color }}>💳 سجل دفعة</Text>
          </TouchableOpacity>
          {remaining <= 0 && (
            <TouchableOpacity
              onPress={() => settleDebt(debt.id)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: Colors.successLight,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 13, color: Colors.success }}>
                ✅ تم السداد
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={showPayment} transparent animationType="slide" onRequestClose={() => setShowPayment(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 10 }}>
            <Text style={{ fontFamily: "Cairo-Bold", fontSize: 18, color: Colors.textPrimary }}>سجل دفعة</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="المبلغ بالجنيه"
              keyboardType="numeric"
              style={{
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 16,
                fontFamily: "Cairo-Regular",
                fontSize: 16,
                textAlign: "right",
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(
                [
                  ["affect_wallet", "من محفظة"],
                  ["record_only", "تسجيل فقط"],
                ] as const
              ).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setWalletImpactMode(key)}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: walletImpactMode === key ? Colors.primary : Colors.border,
                    backgroundColor: walletImpactMode === key ? Colors.primaryPale : Colors.surface,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Cairo-SemiBold",
                      fontSize: 12,
                      color: walletImpactMode === key ? Colors.primary : Colors.textSecondary,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {walletImpactMode === "affect_wallet" && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {wallets.map((wallet) => (
                  <TouchableOpacity
                    key={wallet.id}
                    onPress={() => setWalletId(wallet.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: walletId === wallet.id ? Colors.primary : Colors.border,
                      backgroundColor: walletId === wallet.id ? Colors.primaryPale : Colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 12, color: Colors.textPrimary }}>
                      {wallet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setShowPayment(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: "center" }}>
                <Text style={{ fontFamily: "Cairo-SemiBold", color: Colors.textSecondary }}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePay} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center" }}>
                <Text style={{ fontFamily: "Cairo-SemiBold", color: "#fff" }}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

