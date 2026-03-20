import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { WalletType } from '@/types'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

const TYPES: { key: WalletType; label: string; emoji: string }[] = [
  { key: 'cash', label: 'كاش', emoji: '💵' },
  { key: 'bank', label: 'بنك', emoji: '🏦' },
  { key: 'ewallet', label: 'محفظة إلكترونية', emoji: '📱' },
]

export function AddWalletSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<WalletType>('cash')
  const [balance, setBalance] = useState('')
  const { addWallet } = useFinanceStore()

  const handleSave = () => {
    if (!name.trim()) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addWallet({ name: name.trim(), type, balance: parseFloat(balance) || 0 })
    setName(''); setBalance(''); setType('cash')
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='محفظة جديدة' snapPoints={['60%', '82%']}>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={inputLabel}>اسم المحفظة *</Text>
          <TextInput value={name} onChangeText={setName} placeholder='مثلاً: محفظتي الأساسية' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} />
        </View>

        <View>
          <Text style={inputLabel}>النوع</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TYPES.map((t) => (
              <TouchableOpacity key={t.key} onPress={() => setType(t.key)} style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: type === t.key ? Colors.primaryPale : Colors.surface, borderWidth: 1, borderColor: type === t.key ? Colors.primary : Colors.border, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: type === t.key ? Colors.primary : Colors.textSecondary }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={inputLabel}>الرصيد الابتدائي</Text>
          <TextInput value={balance} onChangeText={setBalance} placeholder='0' keyboardType='numeric' style={[inputStyle, { textAlign: 'right' }]} />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='💾 حفظ المحفظة' onPress={handleSave} disabled={!name.trim()} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
