import { View, Text, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { MoodLevel } from '@/types'
import { Colors } from '@/constants/colors'

const MOODS = [
  { level: 5 as MoodLevel, emoji: '😄', label: 'ممتاز', color: Colors.moodGreat },
  { level: 4 as MoodLevel, emoji: '😊', label: 'كويس', color: Colors.moodGood },
  { level: 3 as MoodLevel, emoji: '😐', label: 'عادي', color: Colors.moodOkay },
  { level: 2 as MoodLevel, emoji: '😔', label: 'زهقان', color: Colors.moodSad },
  { level: 1 as MoodLevel, emoji: '😤', label: 'متوتر', color: Colors.moodStressed },
]

export function MoodPicker({ selected, onSelect }: { selected?: MoodLevel; onSelect: (m: MoodLevel) => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
      {MOODS.map((m) => (
        <TouchableOpacity key={m.level} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelect(m.level) }} style={{ alignItems: 'center', gap: 4 }}>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: selected === m.level ? m.color + '20' : Colors.surfaceGreen,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: selected === m.level ? 2 : 1,
            borderColor: selected === m.level ? m.color : Colors.borderLight,
          }}>
            <Text style={{ fontSize: 26 }}>{m.emoji}</Text>
          </View>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 11, color: selected === m.level ? m.color : Colors.textMuted }}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
