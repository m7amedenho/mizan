import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BarChart, PieChart } from 'react-native-gifted-charts'
import { Colors } from '@/constants/colors'
import { GradientHeader } from '@/components/ui/GradientHeader'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { useTaskStore } from '@/stores/useTaskStore'
import { useHabitStore } from '@/stores/useHabitStore'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useMoodStore } from '@/stores/useMoodStore'
import { useGoalStore } from '@/stores/useGoalStore'
import { EXPENSE_CATEGORIES } from '@/constants/categories'
import { formatAmountAr, getCurrentMonth } from '@/utils/dateHelpers'

const WIDTH = Dimensions.get('window').width - 64

type Period = 'week' | 'month' | '3months'

export default function StatsScreen() {
  const [period, setPeriod] = useState<Period>('month')
  const { tasks } = useTaskStore()
  const { habits, getStreak } = useHabitStore()
  const { transactions, getMonthlyExpenses, getMonthlyIncome } = useFinanceStore()
  const { getLast30Days } = useMoodStore()
  const { goals, challenges } = useGoalStore()

  const month = getCurrentMonth()
  const moodData = getLast30Days()

  const completedTasks = tasks.filter((t) => t.completed).length

  const expenses = getMonthlyExpenses(month)
  const income = getMonthlyIncome(month)
  const saved = income - expenses

  const catData = EXPENSE_CATEGORIES.map((cat) => {
    const amt = transactions.filter((t) => t.type === 'expense' && t.category === cat.key && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0)
    return { value: amt, label: cat.emoji, color: cat.color, text: cat.label }
  }).filter((d) => d.value > 0)

  const moodChartData = moodData.slice(-7).map((m) => ({
    value: m.mood,
    label: m.date.slice(8),
    frontColor: Colors.primary,
  }))

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    const done = tasks.filter((t) => t.dueDate.startsWith(ds) && t.completed).length
    return { value: done, label: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][d.getDay()], frontColor: Colors.primary }
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['bottom']}>
      <GradientHeader title='إحصائياتي 📊' subtitle='تابع تقدمك' />

      <View style={{ flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -24, paddingTop: 10 }}>
        <View style={s.tabRow}>
          {([['week', 'الأسبوع'], ['month', 'الشهر'], ['3months', '٣ أشهر']] as const).map(([key, lbl]) => (
            <TouchableOpacity key={key} onPress={() => setPeriod(key)} style={[s.tab, period === key && s.tabActive]}>
              <Text style={[s.tabText, period === key && s.tabTextActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <AnimatedCard delay={0}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'مهام منجزة', value: completedTasks.toString(), emoji: '✅' },
                { label: 'وفرت', value: saved > 0 ? formatAmountAr(saved) : '٠ج', emoji: '💰' },
                { label: 'أطول streak', value: habits.length > 0 ? `${Math.max(...habits.map((h) => getStreak(h.id)))} يوم` : '٠', emoji: '🔥' },
              ].map((item) => (
                <View key={item.label} style={[s.summaryCard, { flex: 1 }]}>
                  <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 4 }}>{item.emoji}</Text>
                  <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 14, color: Colors.textPrimary, textAlign: 'center' }}>{item.value}</Text>
                  <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 11, color: Colors.textSecondary, textAlign: 'center' }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>

          {last7.some((d) => d.value > 0) && (
            <AnimatedCard delay={80}>
              <View style={s.card}>
                <Text style={s.cardTitle}>المهام المنجزة (آخر ٧ أيام) ✅</Text>
                <BarChart
                  data={last7 as any}
                  width={WIDTH}
                  height={140}
                  barWidth={28}
                  spacing={12}
                  roundedTop
                  frontColor={Colors.primary}
                  noOfSections={4}
                  yAxisTextStyle={{ fontFamily: 'Cairo-Regular', fontSize: 10, color: Colors.textMuted }}
                  xAxisLabelTextStyle={{ fontFamily: 'Cairo-Regular', fontSize: 11, color: Colors.textSecondary }}
                  hideRules
                  barBorderRadius={6}
                />
              </View>
            </AnimatedCard>
          )}

          <AnimatedCard delay={160}>
            <View style={s.card}>
              <Text style={s.cardTitle}>الدخل مقابل المصروف 💰</Text>
              <BarChart
                data={[
                  { value: income, label: 'دخل', frontColor: Colors.success },
                  { value: expenses, label: 'مصروف', frontColor: Colors.danger },
                  { value: Math.max(saved, 0), label: 'وفّرت', frontColor: Colors.primary },
                ] as any}
                width={WIDTH}
                height={140}
                barWidth={50}
                spacing={20}
                roundedTop
                noOfSections={4}
                yAxisTextStyle={{ fontFamily: 'Cairo-Regular', fontSize: 10, color: Colors.textMuted }}
                xAxisLabelTextStyle={{ fontFamily: 'Cairo-Regular', fontSize: 11, color: Colors.textSecondary }}
                hideRules
                barBorderRadius={6}
              />
            </View>
          </AnimatedCard>

          {catData.length > 0 && (
            <AnimatedCard delay={240}>
              <View style={s.card}>
                <Text style={s.cardTitle}>المصروفات حسب التصنيف 🍕</Text>
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  <PieChart
                    data={catData.map((d) => ({ value: d.value, color: d.color, text: d.label })) as any}
                    donut
                    innerRadius={55}
                    radius={85}
                    centerLabelComponent={() => (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 14, color: Colors.textPrimary }}>
                          {formatAmountAr(expenses)}
                        </Text>
                        <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 10, color: Colors.textSecondary }}>إجمالي</Text>
                      </View>
                    )}
                  />
                </View>
                {catData.slice(0, 4).map((d) => (
                  <View key={d.text} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                    <Text style={{ flex: 1, fontFamily: 'Cairo-Regular', fontSize: 13, color: Colors.textPrimary }}>{d.text}</Text>
                    <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.textSecondary }}>{formatAmountAr(d.value)}</Text>
                  </View>
                ))}
              </View>
            </AnimatedCard>
          )}

          {moodChartData.length > 0 && (
            <AnimatedCard delay={300}>
              <View style={s.card}>
                <Text style={s.cardTitle}>مزاجك آخر ٧ أيام 😊</Text>
                <BarChart
                  data={moodChartData as any}
                  width={WIDTH}
                  height={120}
                  barWidth={24}
                  spacing={10}
                  roundedTop
                  maxValue={5}
                  noOfSections={5}
                  yAxisTextStyle={{ fontFamily: 'Cairo-Regular', fontSize: 10, color: Colors.textMuted }}
                  xAxisLabelTextStyle={{ fontFamily: 'Cairo-Regular', fontSize: 10, color: Colors.textSecondary }}
                  hideRules
                  barBorderRadius={4}
                  frontColor={Colors.primary}
                />
              </View>
            </AnimatedCard>
          )}

          <AnimatedCard delay={350}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[s.summaryCard, { flex: 1 }]}>
                <Text style={{ fontSize: 24, textAlign: 'center' }}>🎯</Text>
                <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: Colors.textPrimary, textAlign: 'center' }}>{goals.filter((g) => g.completed).length}</Text>
                <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }}>أهداف محققة</Text>
              </View>
              <View style={[s.summaryCard, { flex: 1 }]}>
                <Text style={{ fontSize: 24, textAlign: 'center' }}>🏆</Text>
                <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: Colors.textPrimary, textAlign: 'center' }}>{challenges.filter((c) => c.completed).length}</Text>
                <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }}>تحديات مكتملة</Text>
              </View>
              <View style={[s.summaryCard, { flex: 1 }]}>
                <Text style={{ fontSize: 24, textAlign: 'center' }}>⚡</Text>
                <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: Colors.textPrimary, textAlign: 'center' }}>{completedTasks}</Text>
                <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }}>مهمة منجزة</Text>
              </View>
            </View>
          </AnimatedCard>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: Colors.primaryXPale, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: Colors.borderLight },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  tabText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 12 },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 4 },
})
