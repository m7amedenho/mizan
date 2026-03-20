import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Debt } from '@/types'
import { Colors } from '@/constants/colors'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcDebtRemaining, calcDebtPercent } from '@/utils/financialCalc'
import { formatAmountAr } from '@/utils/dateHelpers'
import { useFinanceStore } from '@/stores/useFinanceStore'

export function DebtCard({ debt, settled }: { debt: Debt; settled?: boolean }) {
  const [showPayment, setShowPayment] = useState(false)
  const [amount, setAmount] = useState('')
  const { addPayment, settleDebt } = useFinanceStore()

  const remaining = calcDebtRemaining(debt)
  const percent = calcDebtPercent(debt)
  const color = debt.direction === 'owed_to_me' ? Colors.success : Colors.danger

  const handlePay = () => {
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addPayment(debt.id, val)
    setAmount('')
    setShowPayment(false)
  }

  return (
    <View style={{
      backgroundColor: Colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: settled ? Colors.borderLight : `${color}40`,
      opacity: settled ? 0.7 : 1,
    }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 10,
        }}
        >
          <Text style={{ fontSize: 20 }}>{debt.direction === 'owed_to_me' ? '👤' : '🤝'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 15, color: Colors.textPrimary }}>{debt.personName}</Text>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary }}>
            إجمالي:
            {' '}
            {formatAmountAr(debt.totalAmount)}
          </Text>
        </View>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color }}>
          {formatAmountAr(remaining)}
        </Text>
      </View>

      <ProgressBar percent={percent} color={color} height={6} />

      {debt.note && (
        <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 8 }}>
          {debt.note}
        </Text>
      )}

      {!settled && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity onPress={() => setShowPayment(true)} style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: `${color}15`,
            alignItems: 'center',
          }}
          >
            <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color }}>💳 سجل دفعة</Text>
          </TouchableOpacity>
          {remaining <= 0 && (
            <TouchableOpacity onPress={() => settleDebt(debt.id)} style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: Colors.successLight,
              alignItems: 'center',
            }}
            >
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.success }}>✅ تم السداد</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={showPayment} transparent animationType="slide" onRequestClose={() => setShowPayment(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 16 }}>سجل دفعة</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="المبلغ بالجنيه"
              keyboardType="numeric"
              style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, fontFamily: 'Cairo-Regular', fontSize: 16, marginBottom: 16, textAlign: 'right' }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowPayment(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Cairo-SemiBold', color: Colors.textSecondary }}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePay} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Cairo-SemiBold', color: '#fff' }}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
