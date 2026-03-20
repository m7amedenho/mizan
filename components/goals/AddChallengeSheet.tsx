import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useGoalStore } from '@/stores/useGoalStore'
import { getTodayString } from '@/utils/dateHelpers'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

const DURATIONS = [7, 14, 21, 30, 66]

export function AddChallengeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [days, setDays] = useState(21)
  const { addChallenge } = useGoalStore()

  const handleSave = () => {
    if (!title.trim()) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addChallenge({ title: title.trim(), durationDays: days, startDate: getTodayString(), type: 'daily', completed: false })
    setTitle(''); setDays(21)
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='تحدي جديد' snapPoints={['60%', '86%']}>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={inputLabel}>اسم التحدي *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder='مثلاً: اقرأ كل يوم' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} autoFocus />
        </View>
        <View>
          <Text style={inputLabel}>المدة</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DURATIONS.map((d) => (
              <TouchableOpacity key={d} onPress={() => setDays(d)}
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: days === d ? Colors.primary : Colors.surface, borderWidth: 1, borderColor: days === d ? Colors.primary : Colors.border }}>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: days === d ? '#fff' : Colors.textSecondary }}>{d} يوم</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 14 }}>
          <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: Colors.primary }}>
            هتنجز التحدي في {new Date(Date.now() + days * 86400000).toLocaleDateString('ar-EG')} 🎯
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='💪 ابدأ التحدي' onPress={handleSave} disabled={!title.trim()} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
