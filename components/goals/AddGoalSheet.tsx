import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useGoalStore } from '@/stores/useGoalStore'
import { GOAL_CATEGORIES } from '@/constants/categories'
import { GoalCategory, SubGoal } from '@/types'
import { generateId } from '@/utils/dateHelpers'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

export function AddGoalSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('personal')
  const [targetDate, setTargetDate] = useState('')
  const [subGoals, setSubGoals] = useState<SubGoal[]>([])
  const [newSG, setNewSG] = useState('')
  const { addGoal } = useGoalStore()

  const handleSave = () => {
    if (!title.trim()) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addGoal({ title: title.trim(), category, targetDate: targetDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0], subGoals, linkedProjectIds: [], completed: false })
    setTitle(''); setSubGoals([]); setNewSG('')
    onClose()
  }

  const addSG = () => {
    if (!newSG.trim()) return
    setSubGoals((p) => [...p, { id: generateId(), title: newSG.trim(), completed: false }])
    setNewSG('')
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='هدف جديد' snapPoints={['72%', '95%']}>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={inputLabel}>الهدف *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder='إيه هدفك؟' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} autoFocus />
        </View>
        <View>
          <Text style={inputLabel}>التصنيف</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_CATEGORIES.map((c) => (
              <TouchableOpacity key={c.key} onPress={() => setCategory(c.key)}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: category === c.key ? Colors.primaryPale : Colors.surface, borderWidth: 1, borderColor: category === c.key ? Colors.primary : Colors.border, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                <Text>{c.emoji}</Text>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: category === c.key ? Colors.primary : Colors.textSecondary }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View>
          <Text style={inputLabel}>تاريخ الإنجاز المستهدف</Text>
          <TextInput value={targetDate} onChangeText={setTargetDate} placeholder='YYYY-MM-DD' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} />
        </View>
        <View>
          <Text style={inputLabel}>الخطوات الفرعية</Text>
          {subGoals.map((sg, i) => (
            <View key={sg.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
              <TouchableOpacity onPress={() => setSubGoals((p) => p.filter((_, idx) => idx !== i))}>
                <Ionicons name='close-circle' size={18} color={Colors.danger} />
              </TouchableOpacity>
              <Text style={{ flex: 1, fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textPrimary, marginRight: 8 }}>{sg.title}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput value={newSG} onChangeText={setNewSG} placeholder='أضف خطوة...' placeholderTextColor={Colors.textMuted} style={[inputStyle, { flex: 1, textAlign: 'right' }]} onSubmitEditing={addSG} returnKeyType='done' />
            <TouchableOpacity onPress={addSG} style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='add' size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='💾 حفظ الهدف' onPress={handleSave} disabled={!title.trim()} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
