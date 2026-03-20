import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { GradientHeader } from '@/components/ui/GradientHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { GoalCard } from '@/components/goals/GoalCard'
import { ChallengeCard } from '@/components/goals/ChallengeCard'
import { AddGoalSheet } from '@/components/goals/AddGoalSheet'
import { AddChallengeSheet } from '@/components/goals/AddChallengeSheet'
import { JournalEntry } from '@/components/goals/JournalEntry'
import { useGoalStore } from '@/stores/useGoalStore'
import { useJournalStore } from '@/stores/useJournalStore'
import { useMoodStore } from '@/stores/useMoodStore'
import { MoodPicker } from '@/components/ui/MoodPicker'
import { getTodayString } from '@/utils/dateHelpers'

type Tab = 'goals' | 'challenges' | 'journal'

export default function GoalsScreen() {
  const [tab, setTab] = useState<Tab>('goals')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddChallenge, setShowAddChallenge] = useState(false)
  const { goals, challenges } = useGoalStore()
  const { getEntryByDate } = useJournalStore()
  const { getTodayMood, logMood } = useMoodStore()
  const todayMood = getTodayMood()
  const todayEntry = getEntryByDate(getTodayString())

  void todayEntry

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['bottom']}>
      <GradientHeader
        title='أهدافي 🎯'
        subtitle={`${goals.filter((g) => !g.completed).length} هدف نشط`}
        rightAction={{
          icon: 'add-outline',
          onPress: () => {
            if (tab === 'goals') setShowAddGoal(true)
            if (tab === 'challenges') setShowAddChallenge(true)
          },
        }}
      />

      <View style={s.tabRow}>
        {([['goals', 'الأهداف'], ['challenges', 'التحديات'], ['journal', 'يومياتي']] as const).map(([key, lbl]) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={[s.tab, tab === key && s.tabActive]}>
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'goals' && (
        goals.length === 0
          ? <EmptyState emoji='🌟' title='مفيش أهداف!' subtitle='حدد هدفك الأول وابدأ رحلتك' actionLabel='+ هدف جديد' onAction={() => setShowAddGoal(true)} />
          : (
              <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}>
                {goals.filter((g) => !g.completed).map((g, i) => (
                  <AnimatedCard key={g.id} delay={Math.min(i * 70, 350)}>
                    <GoalCard goal={g} />
                  </AnimatedCard>
                ))}
                {goals.filter((g) => g.completed).length > 0 && (
                  <>
                    <Text style={s.sectionTitle}>✅ المحققة</Text>
                    {goals.filter((g) => g.completed).map((g, i) => (
                      <AnimatedCard key={g.id} delay={Math.min(i * 65, 350)}>
                        <GoalCard goal={g} />
                      </AnimatedCard>
                    ))}
                  </>
                )}
              </ScrollView>
            )
      )}

      {tab === 'challenges' && (
        challenges.length === 0
          ? <EmptyState emoji='💪' title='مفيش تحديات!' subtitle='تحدى نفسك وابدأ دلوقتي' actionLabel='+ تحدي جديد' onAction={() => setShowAddChallenge(true)} />
          : (
              <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}>
                {challenges.filter((c) => !c.completed).map((c, i) => (
                  <AnimatedCard key={c.id} delay={Math.min(i * 70, 350)}>
                    <ChallengeCard challenge={c} />
                  </AnimatedCard>
                ))}
                {challenges.filter((c) => c.completed).length > 0 && (
                  <>
                    <Text style={s.sectionTitle}>🏆 المكتملة</Text>
                    {challenges.filter((c) => c.completed).map((c, i) => (
                      <AnimatedCard key={c.id} delay={Math.min(i * 65, 350)}>
                        <ChallengeCard challenge={c} />
                      </AnimatedCard>
                    ))}
                  </>
                )}
              </ScrollView>
            )
      )}

      {tab === 'journal' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}>
          <AnimatedCard delay={0}>
            <View style={{ backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 12 }}>
                كيف حالك النهارده؟ 🌤️
              </Text>
              <MoodPicker selected={todayMood?.mood} onSelect={logMood} />
            </View>
          </AnimatedCard>
          <AnimatedCard delay={80}>
            <JournalEntry />
          </AnimatedCard>
        </ScrollView>
      )}

      <AddGoalSheet visible={showAddGoal} onClose={() => setShowAddGoal(false)} />
      <AddChallengeSheet visible={showAddChallenge} onClose={() => setShowAddChallenge(false)} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.surface },
  tabText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 15, color: Colors.textSecondary, marginTop: 8 },
})

