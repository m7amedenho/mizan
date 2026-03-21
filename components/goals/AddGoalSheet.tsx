import { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useGoalStore } from '@/stores/useGoalStore'
import { GOAL_CATEGORIES } from '@/constants/categories'
import { GoalCategory, SubGoal } from '@/types'
import { addDaysLocal, generateId, toLocalDateString } from '@/utils/dateHelpers'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'
import { NativeDateField } from '@/components/ui/NativeDateField'

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
    addGoal({
      title: title.trim(),
      category,
      targetDate: targetDate || toLocalDateString(addDaysLocal(new Date(), 90)),
      subGoals,
      linkedProjectIds: [],
      completed: false,
    })
    setTitle('')
    setTargetDate('')
    setSubGoals([])
    setNewSG('')
    onClose()
  }

  const addSG = () => {
    if (!newSG.trim()) return
    setSubGoals((previous) => [...previous, { id: generateId(), title: newSG.trim(), completed: false }])
    setNewSG('')
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='هدف جديد' snapPoints={['76%', '96%']}>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={inputLabel}>الهدف *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder='إيه هدفك؟'
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { textAlign: 'right' }]}
            autoFocus
          />
        </View>

        <View>
          <Text style={inputLabel}>التصنيف</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setCategory(item.key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: category === item.key ? Colors.primaryPale : Colors.surface,
                  borderWidth: 1,
                  borderColor: category === item.key ? Colors.primary : Colors.border,
                  flexDirection: 'row',
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                <Text>{item.emoji}</Text>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: category === item.key ? Colors.primary : Colors.textSecondary }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <NativeDateField
          label='تاريخ الإنجاز المستهدف'
          value={targetDate}
          minimumDate={new Date()}
          onChange={setTargetDate}
        />

        <View>
          <Text style={inputLabel}>الخطوات الفرعية</Text>
          {subGoals.map((item, index) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
              <TouchableOpacity onPress={() => setSubGoals((previous) => previous.filter((_, currentIndex) => currentIndex !== index))}>
                <Ionicons name='close-circle' size={18} color={Colors.danger} />
              </TouchableOpacity>
              <Text style={{ flex: 1, fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textPrimary, marginRight: 8 }}>{item.title}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput
              value={newSG}
              onChangeText={setNewSG}
              placeholder='أضف خطوة...'
              placeholderTextColor={Colors.textMuted}
              style={[inputStyle, { flex: 1, textAlign: 'right' }]}
              onSubmitEditing={addSG}
              returnKeyType='done'
            />
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
