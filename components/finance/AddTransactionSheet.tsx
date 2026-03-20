import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { getTodayString } from '@/utils/dateHelpers'
import { getCurrentLocation } from '@/utils/geofencing'
import { ExpenseCategory, IncomeCategory } from '@/types'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

export function AddTransactionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('food')
  const [walletId, setWalletId] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number; placeName: string } | null>(null)
  const [loadingLoc, setLoadingLoc] = useState(false)
  const { addTransaction, wallets } = useFinanceStore()

  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleSave = () => {
    const val = parseFloat(amount)
    if (!val || !walletId) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addTransaction({
      type,
      amount: val,
      category,
      name: name || (cats.find((c) => c.key === category)?.label ?? ''),
      walletId,
      date: getTodayString(),
      location: location ?? undefined,
    })
    setAmount(''); setName(''); setType('expense'); setCategory('food'); setWalletId(''); setLocation(null)
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='معاملة جديدة' snapPoints={['72%', '95%']}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 4 }}>
          {(['expense', 'income'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => { setType(t); setCategory(t === 'expense' ? 'food' : 'salary') }}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: type === t ? Colors.surface : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: type === t ? (t === 'expense' ? Colors.danger : Colors.primary) : Colors.textSecondary }}>
                {t === 'expense' ? '🔴 مصروف' : '🟢 دخل'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text style={inputLabel}>المبلغ *</Text>
          <TextInput value={amount} onChangeText={setAmount} placeholder='0' keyboardType='numeric' style={[inputStyle, { fontSize: 24, height: 60, textAlign: 'center', fontFamily: 'Cairo-Bold' }]} />
        </View>

        <View>
          <Text style={inputLabel}>التصنيف</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {cats.map((c) => (
              <TouchableOpacity key={c.key} onPress={() => setCategory(c.key as any)}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: category === c.key ? Colors.primaryPale : Colors.surface, borderWidth: 1, borderColor: category === c.key ? Colors.primary : Colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: category === c.key ? Colors.primary : Colors.textSecondary }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={inputLabel}>الاسم (اختياري)</Text>
          <TextInput value={name} onChangeText={setName} placeholder='مثلاً: غداء' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} />
        </View>

        <View>
          <Text style={inputLabel}>المحفظة *</Text>
          {wallets.length === 0
            ? <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: Colors.danger }}>أضف محفظة أولاً</Text>
            : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {wallets.map((w) => (
                  <TouchableOpacity key={w.id} onPress={() => setWalletId(w.id)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: walletId === w.id ? Colors.primary : Colors.surface, borderWidth: 1, borderColor: walletId === w.id ? Colors.primary : Colors.border }}>
                    <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: walletId === w.id ? '#fff' : Colors.textSecondary }}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
          }
        </View>

        <View>
          <Text style={inputLabel}>الموقع (اختياري)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={async () => {
                setLoadingLoc(true)
                const loc = await getCurrentLocation()
                if (loc) setLocation({ latitude: loc.lat, longitude: loc.lng, placeName: loc.placeName })
                setLoadingLoc(false)
              }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: location ? Colors.primaryPale : Colors.surface, borderWidth: 1, borderColor: location ? Colors.primary : Colors.border }}
            >
              <Ionicons name='location-outline' size={18} color={location ? Colors.primary : Colors.textSecondary} />
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: location ? Colors.primary : Colors.textSecondary, flex: 1 }} numberOfLines={1}>
                {loadingLoc ? 'جاري تحديد الموقع...' : location ? location.placeName : 'أضف الموقع'}
              </Text>
            </TouchableOpacity>
            {location && (
              <TouchableOpacity onPress={() => setLocation(null)}>
                <Ionicons name='close' size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='💾 حفظ' onPress={handleSave} disabled={!amount || !walletId} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
