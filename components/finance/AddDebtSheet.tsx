import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { getTodayString } from '@/utils/dateHelpers'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

export function AddDebtSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [direction, setDirection] = useState<'owed_to_me' | 'i_owe'>('owed_to_me')
  const [personName, setPersonName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const { addDebt } = useFinanceStore()

  const handleSave = () => {
    if (!personName.trim() || !amount) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addDebt({ direction, personName: personName.trim(), totalAmount: parseFloat(amount), date: getTodayString(), note })
    setPersonName(''); setAmount(''); setNote('')
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='دين جديد' snapPoints={['68%', '92%']}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 4 }}>
          {([['owed_to_me', '💚 ليك عند حد'], ['i_owe', '❤️ عليك لحد']] as const).map(([key, lbl]) => (
            <TouchableOpacity key={key} onPress={() => setDirection(key)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: direction === key ? Colors.surface : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: direction === key ? Colors.primary : Colors.textSecondary }}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text style={inputLabel}>اسم الشخص *</Text>
          <TextInput value={personName} onChangeText={setPersonName} placeholder='مثلاً: أحمد' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} />
        </View>

        <View>
          <Text style={inputLabel}>المبلغ *</Text>
          <TextInput value={amount} onChangeText={setAmount} placeholder='0' keyboardType='numeric' style={[inputStyle, { textAlign: 'right' }]} />
        </View>

        <View>
          <Text style={inputLabel}>ملاحظة</Text>
          <TextInput value={note} onChangeText={setNote} placeholder='سبب الدين...' placeholderTextColor={Colors.textMuted} style={[inputStyle, { height: 80, textAlignVertical: 'top', paddingTop: 12, textAlign: 'right' }]} multiline />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='💾 حفظ الدين' onPress={handleSave} disabled={!personName || !amount} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
