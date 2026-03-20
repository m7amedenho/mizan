import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { useJournalStore } from '@/stores/useJournalStore'
import { getTodayString } from '@/utils/dateHelpers'

export function JournalEntry() {
  const { getEntryByDate, addOrUpdateEntry, getJournalStreak } = useJournalStore()
  const today = getTodayString()
  const existing = getEntryByDate(today)
  const streak = getJournalStreak()

  const [bestThing, setBestThing] = useState(existing?.bestThing ?? '')
  const [learned, setLearned] = useState(existing?.learned ?? '')
  const [tomorrowGoal, setTomorrowGoal] = useState(existing?.tomorrowGoal ?? '')
  const [saved, setSaved] = useState(!!existing)

  const handleSave = () => {
    if (!bestThing && !learned && !tomorrowGoal) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addOrUpdateEntry(today, { bestThing, learned, tomorrowGoal })
    setSaved(true)
  }

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: Colors.textPrimary }}>📔 يومياتي</Text>
        {streak > 0 && <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.warning }}>🔥 {streak} يوم</Text>}
      </View>

      {[
        { label: '🌟 أحسن حاجة حصلت النهارده؟', value: bestThing, onChange: setBestThing },
        { label: '📚 إيه اللي اتعلمته؟', value: learned, onChange: setLearned },
        { label: '🎯 هدفي بكره؟', value: tomorrowGoal, onChange: setTomorrowGoal },
      ].map((q, i) => (
        <View key={i} style={{ marginBottom: 14 }}>
          <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 6 }}>{q.label}</Text>
          <TextInput
            value={q.value} onChangeText={(t) => { q.onChange(t); setSaved(false) }}
            placeholder='اكتب هنا...'
            placeholderTextColor={Colors.textMuted}
            multiline numberOfLines={2}
            style={{ backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.borderLight, padding: 10, fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top', minHeight: 60 }}
            textAlign='right'
          />
        </View>
      ))}

      <TouchableOpacity onPress={handleSave}
        style={{ paddingVertical: 12, borderRadius: 12, backgroundColor: saved ? Colors.successLight : Colors.primary, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: saved ? Colors.success : '#fff' }}>
          {saved ? '✅ تم الحفظ' : '💾 حفظ اليومية'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
