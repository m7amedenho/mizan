import { View, Text, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Challenge } from '@/types'
import { Colors } from '@/constants/colors'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useGoalStore } from '@/stores/useGoalStore'
import { getTodayString } from '@/utils/dateHelpers'

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { checkInChallenge, getChallengeStreak } = useGoalStore()
  const streak = getChallengeStreak(challenge.id)
  const percent = (challenge.checkIns.length / challenge.durationDays) * 100
  const checkedToday = challenge.checkIns.includes(getTodayString())
  const scale = useSharedValue(1)

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handleCheckIn = () => {
    if (checkedToday || challenge.completed) return
    scale.value = withSpring(1.15, {}, () => { scale.value = withSpring(1) })
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    checkInChallenge(challenge.id)
  }

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: challenge.completed ? Colors.successLight : Colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 15, color: Colors.textPrimary }}>{challenge.title}</Text>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
            {challenge.checkIns.length}/{challenge.durationDays} يوم
            {streak > 1 && ` · 🔥 ${streak} يوم متتالي`}
          </Text>
        </View>
        <Animated.View style={btnStyle}>
          <TouchableOpacity onPress={handleCheckIn} disabled={checkedToday || challenge.completed}
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: checkedToday ? Colors.successLight : Colors.primaryLight, borderWidth: 1.5, borderColor: checkedToday ? Colors.success : Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>{challenge.completed ? '🏆' : checkedToday ? '✅' : '⭕'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <ProgressBar percent={percent} height={7} color={challenge.completed ? Colors.success : Colors.primary} />
    </View>
  )
}
