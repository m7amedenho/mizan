import { useRef } from 'react'
import {
  Animated, TouchableOpacity, View, Text, StyleSheet,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Habit } from '@/types'
import { Colors } from '@/constants/colors'
import { useHabitStore } from '@/stores/useHabitStore'

const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']

export function HabitCard({ habit }: { habit: Habit }) {
  const { checkInHabit, getStreak, isCompletedToday, getCompletedCountToday, getWeekGrid } = useHabitStore()
  const checkScale = useRef(new Animated.Value(1)).current
  const cardScale = useRef(new Animated.Value(1)).current

  const streak = getStreak(habit.id)
  const targetPerDay = Math.max(1, habit.targetPerDay ?? 1)
  const todayCount = getCompletedCountToday(habit.id)
  const done = isCompletedToday(habit.id)
  const grid = getWeekGrid(habit.id)

  const handleCheck = () => {
    if (done) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1.4, speed: 45,
        bounciness: 14, useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1, speed: 22,
        bounciness: 8, useNativeDriver: true,
      }),
    ]).start()

    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 1.025, duration: 90, useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1, speed: 22,
        bounciness: 4, useNativeDriver: true,
      }),
    ]).start()

    checkInHabit(habit.id)
  }

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <View style={s.card}>
        <View style={s.row}>
          <Text style={{ fontSize: 30, marginLeft: 12 }}>{habit.emoji}</Text>

          <View style={{ flex: 1 }}>
            <Text style={s.name}>{habit.name}</Text>
            <Text style={s.meta}>
              اليوم {Math.min(todayCount, targetPerDay)}/{targetPerDay}
              {habit.reminderTimes?.length ? ` • ${habit.reminderTimes.length} تذكير` : ''}
            </Text>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
              {grid.map((isDone, i) => (
                <View key={i} style={{
                  width: 24, height: 24, borderRadius: 7,
                  backgroundColor: isDone ? Colors.primaryMid : Colors.primaryXPale,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: isDone ? 0 : 1,
                  borderColor: Colors.borderLight,
                }}>
                  <Text style={{
                    fontSize: 9, fontFamily: 'Cairo-SemiBold',
                    color: isDone ? '#fff' : Colors.textMuted,
                  }}>{DAYS_AR[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ alignItems: 'center', gap: 5 }}>
            {streak > 0 && (
              <Text style={s.streak}>🔥 {streak}</Text>
            )}
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <TouchableOpacity
                onPress={handleCheck}
                disabled={done}
                activeOpacity={0.8}
                style={[s.checkBtn, done && s.checkDone]}
              >
                <Text style={{ fontSize: done ? 20 : 13, fontFamily: done ? undefined : 'Cairo-Bold', color: done ? undefined : Colors.primary }}>
                  {done ? '✅' : `+1`}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: 'Cairo-SemiBold', fontSize: 15, color: Colors.textPrimary },
  meta: { fontFamily: 'Cairo-Regular', fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  streak: { fontFamily: 'Cairo-Bold', fontSize: 11, color: Colors.primaryMid },
  checkBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryXPale,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: Colors.primaryPale,
    borderColor: Colors.primaryLight,
  },
})
