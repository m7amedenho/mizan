import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { Colors } from '@/constants/colors'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EXPENSE_CATEGORIES } from '@/constants/categories'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { formatAmountAr } from '@/utils/dateHelpers'

export function BudgetCard({ category, month }: { category: string; month: string }) {
  const [editing, setEditing] = useState(false)
  const [limit, setLimit] = useState('')
  const { getBudgetUsage, setBudget } = useFinanceStore()
  const { spent, limit: currentLimit, percent } = getBudgetUsage(category, month)
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === category)

  const barColor = percent >= 90 ? Colors.danger : percent >= 70 ? Colors.warning : Colors.primary

  const handleSave = () => {
    const val = parseFloat(limit)
    if (val > 0) setBudget(category, val, month)
    setEditing(false)
  }

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 22, marginLeft: 10 }}>{cat?.emoji ?? '📦'}</Text>
        <Text style={{ flex: 1, fontFamily: 'Cairo-SemiBold', fontSize: 14, color: Colors.textPrimary }}>{cat?.label ?? category}</Text>
        {percent >= 80 && <Text style={{ fontSize: 16 }}>⚠️</Text>}
        <TouchableOpacity onPress={() => { setLimit(currentLimit.toString()); setEditing(true) }}>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.primary }}>تعديل</Text>
        </TouchableOpacity>
      </View>

      {editing ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={limit}
            onChangeText={setLimit}
            placeholder="الحد الشهري"
            keyboardType="numeric"
            style={{ flex: 1, height: 40, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, fontFamily: 'Cairo-Regular', fontSize: 14, textAlign: 'right' }}
          />
          <TouchableOpacity onPress={handleSave} style={{ paddingHorizontal: 16, height: 40, borderRadius: 8, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Cairo-SemiBold', color: '#fff', fontSize: 13 }}>حفظ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ProgressBar percent={currentLimit > 0 ? percent : 0} color={barColor} height={7} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textMuted }}>
              {formatAmountAr(spent)}
              {' '}
              من
              {' '}
              {currentLimit > 0 ? formatAmountAr(currentLimit) : '؟'}
            </Text>
            {currentLimit > 0 && (
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: barColor }}>
                {Math.round(percent)}
                ٪
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  )
}
