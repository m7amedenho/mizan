import { useMemo, useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { formatAmountAr, getTodayString } from '@/utils/dateHelpers'
import { getCurrentLocation } from '@/utils/geofencing'
import { ExpenseCategory, IncomeCategory, TransactionFlow } from '@/types'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'
import { calcDebtRemaining } from '@/utils/financialCalc'

type EntryType = 'expense' | 'income' | 'transfer'

const FLOW_LABELS: Record<'expense' | 'income', { key: Exclude<TransactionFlow, 'transfer'>; label: string }[]> = {
  expense: [
    { key: 'regular', label: 'عادي' },
    { key: 'debt_new', label: 'سلفة لشخص' },
    { key: 'debt_payment', label: 'سداد دين عليك' },
  ],
  income: [
    { key: 'regular', label: 'عادي' },
    { key: 'debt_payment', label: 'تحصيل دين ليك' },
    { key: 'debt_new', label: 'استلاف من شخص' },
  ],
}

export function AddTransactionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [entryType, setEntryType] = useState<EntryType>('expense')
  const [flow, setFlow] = useState<Exclude<TransactionFlow, 'transfer'>>('regular')
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('food')
  const [walletId, setWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [personName, setPersonName] = useState('')
  const [selectedDebtId, setSelectedDebtId] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number; placeName: string } | null>(null)
  const [loadingLoc, setLoadingLoc] = useState(false)

  const { addTransaction, addTransfer, wallets, debts } = useFinanceStore()

  const transactionType = entryType === 'transfer' ? 'expense' : entryType
  const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const relevantDirection = useMemo(() => {
    if (entryType === 'expense' && flow === 'debt_new') return 'owed_to_me'
    if (entryType === 'expense' && flow === 'debt_payment') return 'i_owe'
    if (entryType === 'income' && flow === 'debt_new') return 'i_owe'
    if (entryType === 'income' && flow === 'debt_payment') return 'owed_to_me'
    return null
  }, [entryType, flow])

  const relevantDebts = useMemo(() => (
    relevantDirection
      ? debts.filter((debt) => !debt.settled && debt.direction === relevantDirection)
      : []
  ), [debts, relevantDirection])

  const selectedDebt = relevantDebts.find((debt) => debt.id === selectedDebtId)

  const setMode = (nextType: EntryType) => {
    setEntryType(nextType)
    setAmount('')
    setName('')
    setNote('')
    setPersonName('')
    setSelectedDebtId('')
    setLocation(null)

    if (nextType === 'expense') {
      setFlow('regular')
      setCategory('food')
      setToWalletId('')
      return
    }

    if (nextType === 'income') {
      setFlow('regular')
      setCategory('salary')
      setToWalletId('')
      return
    }

    setToWalletId('')
  }

  const handleSave = () => {
    const value = parseFloat(amount)
    if (!value || value <= 0 || !walletId) return

    if (entryType === 'transfer') {
      if (!toWalletId || toWalletId === walletId) return
      const sourceWallet = wallets.find((wallet) => wallet.id === walletId)
      if (!sourceWallet) return
      if (sourceWallet.balance < value) {
        Alert.alert(
          'الرصيد غير كافٍ',
          `المتاح في ${sourceWallet.name} هو ${formatAmountAr(sourceWallet.balance)} فقط.`,
        )
        return
      }
      const transferResult = addTransfer({
        amount: value,
        fromWalletId: walletId,
        toWalletId,
        date: getTodayString(),
        name: name.trim() || `تحويل إلى ${wallets.find((wallet) => wallet.id === toWalletId)?.name ?? 'محفظة'}`,
        note: note.trim() || undefined,
      })
      if (!transferResult.ok) {
        Alert.alert('تعذر التحويل', transferResult.error || 'حدثت مشكلة أثناء التحويل.')
        return
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      resetForm()
      onClose()
      return
    }

    if (flow === 'debt_new' && !personName.trim()) return
    if (flow === 'debt_payment' && !selectedDebtId) return

    const defaultName = flow === 'debt_payment'
      ? (selectedDebt ? `تسوية مع ${selectedDebt.personName}` : '')
      : flow === 'debt_new'
        ? (personName.trim() ? `معاملة دين - ${personName.trim()}` : '')
        : (categories.find((item) => item.key === category)?.label ?? '')

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addTransaction({
      type: transactionType,
      flow,
      amount: value,
      category,
      name: name.trim() || defaultName,
      walletId,
      date: getTodayString(),
      note: note.trim() || undefined,
      debtId: flow === 'debt_payment' ? selectedDebtId : undefined,
      personName: flow === 'debt_new' ? personName.trim() : selectedDebt?.personName,
      location: location ?? undefined,
    })
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setAmount('')
    setName('')
    setNote('')
    setPersonName('')
    setSelectedDebtId('')
    setFlow('regular')
    setCategory('food')
    setWalletId('')
    setToWalletId('')
    setLocation(null)
    setEntryType('expense')
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='عملية مالية جديدة' snapPoints={['82%', '97%']}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 4 }}>
          {([
            ['expense', '🔴 مصروف'],
            ['income', '🟢 دخل'],
            ['transfer', '🔁 تحويل'],
          ] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setMode(key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: entryType === key ? Colors.surface : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: entryType === key ? Colors.primary : Colors.textSecondary }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {entryType !== 'transfer' ? (
          <View>
            <Text style={inputLabel}>نوع العملية</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {FLOW_LABELS[entryType].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => {
                    setFlow(item.key)
                    setPersonName('')
                    setSelectedDebtId('')
                  }}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: flow === item.key ? Colors.primary : Colors.border,
                    backgroundColor: flow === item.key ? Colors.primaryPale : Colors.surface,
                  }}
                >
                  <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: flow === item.key ? Colors.primary : Colors.textSecondary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <View>
          <Text style={inputLabel}>المبلغ *</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder='0'
            keyboardType='numeric'
            style={[inputStyle, { fontSize: 24, height: 60, textAlign: 'center', fontFamily: 'Cairo-Bold' }]}
          />
        </View>

        {entryType !== 'transfer' ? (
          <View>
            <Text style={inputLabel}>التصنيف</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setCategory(item.key as ExpenseCategory | IncomeCategory)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: category === item.key ? Colors.primaryPale : Colors.surface,
                    borderWidth: 1,
                    borderColor: category === item.key ? Colors.primary : Colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
                  <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: category === item.key ? Colors.primary : Colors.textSecondary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {flow === 'debt_new' && entryType !== 'transfer' ? (
          <View>
            <Text style={inputLabel}>الشخص</Text>
            {relevantDebts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
                {relevantDebts.map((debt) => (
                  <TouchableOpacity
                    key={debt.id}
                    onPress={() => setPersonName(debt.personName)}
                    style={{
                      borderRadius: 18,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: personName === debt.personName ? Colors.primary : Colors.border,
                      backgroundColor: personName === debt.personName ? Colors.primaryPale : Colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: Colors.textPrimary }}>
                      {debt.personName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
            <TextInput
              value={personName}
              onChangeText={setPersonName}
              placeholder='اختر شخصًا أو اكتب اسمًا جديدًا'
              placeholderTextColor={Colors.textMuted}
              style={[inputStyle, { textAlign: 'right' }]}
            />
          </View>
        ) : null}

        {flow === 'debt_payment' && entryType !== 'transfer' ? (
          <View>
            <Text style={inputLabel}>اختر الدين المفتوح</Text>
            {relevantDebts.length === 0 ? (
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: Colors.danger }}>لا يوجد دين مفتوح مناسب لهذه العملية.</Text>
            ) : (
              <View style={{ gap: 8 }}>
                {relevantDebts.map((debt) => {
                  const active = selectedDebtId === debt.id
                  return (
                    <TouchableOpacity
                      key={debt.id}
                      onPress={() => setSelectedDebtId(debt.id)}
                      style={{
                        borderRadius: 16,
                        backgroundColor: active ? Colors.primaryPale : Colors.surface,
                        borderWidth: 1,
                        borderColor: active ? Colors.primary : Colors.border,
                        padding: 12,
                        gap: 2,
                      }}
                    >
                      <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 14, color: Colors.textPrimary }}>{debt.personName}</Text>
                      <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary }}>
                        المتبقي: {calcDebtRemaining(debt).toLocaleString('ar-EG')} جنيه
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        ) : null}

        <View>
          <Text style={inputLabel}>{entryType === 'transfer' ? 'اسم التحويل' : 'الاسم (اختياري)'}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={entryType === 'transfer' ? 'مثلاً: تحويل للبنك' : 'مثلاً: غداء'}
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { textAlign: 'right' }]}
          />
        </View>

        <View>
          <Text style={inputLabel}>{entryType === 'transfer' ? 'من محفظة *' : 'المحفظة *'}</Text>
          {wallets.length === 0 ? (
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: Colors.danger }}>أضف محفظة أولاً</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  onPress={() => setWalletId(wallet.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: walletId === wallet.id ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: walletId === wallet.id ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: walletId === wallet.id ? '#fff' : Colors.textSecondary }}>
                    {wallet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {entryType === 'transfer' ? (
          <View>
            <Text style={inputLabel}>إلى محفظة *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {wallets.filter((wallet) => wallet.id !== walletId).map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  onPress={() => setToWalletId(wallet.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: toWalletId === wallet.id ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: toWalletId === wallet.id ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: toWalletId === wallet.id ? '#fff' : Colors.textSecondary }}>
                    {wallet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {entryType !== 'transfer' ? (
          <View>
            <Text style={inputLabel}>ملاحظة</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder='وصف مختصر للمعاملة أو سبب الدين'
              placeholderTextColor={Colors.textMuted}
              multiline
              style={[inputStyle, { minHeight: 80, textAlign: 'right', textAlignVertical: 'top', paddingTop: 12 }]}
            />
          </View>
        ) : (
          <View>
            <Text style={inputLabel}>ملاحظة التحويل</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder='سبب التحويل (اختياري)'
              placeholderTextColor={Colors.textMuted}
              style={[inputStyle, { textAlign: 'right' }]}
            />
          </View>
        )}

        {entryType !== 'transfer' ? (
          <View>
            <Text style={inputLabel}>الموقع (اختياري)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  setLoadingLoc(true)
                  const currentLocation = await getCurrentLocation()
                  if (currentLocation) {
                    setLocation({ latitude: currentLocation.lat, longitude: currentLocation.lng, placeName: currentLocation.placeName })
                  }
                  setLoadingLoc(false)
                }}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: location ? Colors.primaryPale : Colors.surface,
                  borderWidth: 1,
                  borderColor: location ? Colors.primary : Colors.border,
                }}
              >
                <Ionicons name='location-outline' size={18} color={location ? Colors.primary : Colors.textSecondary} />
                <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: location ? Colors.primary : Colors.textSecondary, flex: 1 }} numberOfLines={1}>
                  {loadingLoc ? 'جاري تحديد الموقع...' : location ? location.placeName : 'أضف الموقع'}
                </Text>
              </TouchableOpacity>
              {location ? (
                <TouchableOpacity onPress={() => setLocation(null)}>
                  <Ionicons name='close' size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton
            label='💾 حفظ'
            onPress={handleSave}
            disabled={
              !amount
              || !walletId
              || (entryType === 'transfer' && !toWalletId)
              || (entryType !== 'transfer' && flow === 'debt_new' && !personName.trim())
              || (entryType !== 'transfer' && flow === 'debt_payment' && !selectedDebtId)
            }
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
