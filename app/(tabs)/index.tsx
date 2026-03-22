import { useState, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ImageBackground, Pressable,
  StatusBar, Platform
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MoodPicker } from '@/components/ui/MoodPicker'
import { AddTaskSheet } from '@/components/tasks/AddTaskSheet'
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet'
import { useAppStore } from '@/stores/useAppStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useHabitStore } from '@/stores/useHabitStore'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useGoalStore } from '@/stores/useGoalStore'
import { useMoodStore } from '@/stores/useMoodStore'
import { formatAmountAr, formatDateAr, getTodayString } from '@/utils/dateHelpers'
import { DAILY_QUOTES } from '@/constants/quotes'

const HEADER_BG = require('@/assets/images/header-bg.jpg')

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)


  // Stores
  const { settings } = useAppStore()
  const { tasks, getTodayTasks, toggleTask } = useTaskStore()
  const { habits, checkInHabit, isCompletedToday, getCompletedCountToday, getStreak } = useHabitStore()
  const { getTotalBalance, getMonthlyExpenses, getMonthlyIncome } = useFinanceStore()
  const { challenges } = useGoalStore()
  const { getTodayMood, logMood } = useMoodStore()

  const today = getTodayString()
  const month = today.slice(0, 7)
  const todayTasks = getTodayTasks()
  const doneTasks = todayTasks.filter((t) => t.completed).length
  const totalTasks = todayTasks.length
  const todayMood = getTodayMood()
  const balance = getTotalBalance()
  const expenses = getMonthlyExpenses(month)
  const income = getMonthlyIncome(month)
  const weekday = new Date().getDay()
  const todayHabits = habits.filter((h) => h.frequency === 'daily' || h.days?.includes(weekday))
  const doneHabits = todayHabits.filter((h) => isCompletedToday(h.id)).length
  const activeChallenge = challenges.find((c) => !c.completed)
  const maxStreak = habits.length > 0
    ? Math.max(...habits.map((h) => getStreak(h.id)))
    : 0
  const quote = DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length]



  // FAB animation
  const fabRotate = useRef(new Animated.Value(0)).current
  const fabItems = useRef(new Animated.Value(0)).current

  const animateFab = (opening: boolean, afterClose?: () => void) => {
    if (opening) setFabOpen(true)
    Animated.parallel([
      Animated.spring(fabRotate, {
        toValue: opening ? 1 : 0,
        useNativeDriver: true,
        speed: 24, bounciness: 8,
      }),
      Animated.spring(fabItems, {
        toValue: opening ? 1 : 0,
        useNativeDriver: true,
        speed: 20, bounciness: 10,
      }),
    ]).start(() => {
      if (!opening) {
        setFabOpen(false)
        afterClose?.()
      }
    })
  }

  const openFab = () => {
    if (fabOpen) return
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    animateFab(true)
  }

  const closeFab = (afterClose?: () => void) => {
    if (!fabOpen) {
      afterClose?.()
      return
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    animateFab(false, afterClose)
  }

  const toggleFab = () => {
    if (fabOpen) closeFab()
    else openFab()
  }

  const fabRotation = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  const FAB_ACTIONS = [
    { label: 'مهمة جديدة', icon: 'add-circle-outline', action: () => closeFab(() => setShowAddTask(true)) },
    { label: 'مصروف جديد', icon: 'cash-outline', action: () => closeFab(() => setShowAddTx(true)) },
  ]

  void tasks
  void doneHabits

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar translucent backgroundColor='transparent' barStyle='light-content' />

      {/* ── HERO HEADER BACKGROUND ── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }}>
        <ImageBackground source={HEADER_BG} style={{ width: '100%', height: '100%' }}>
          <LinearGradient
            colors={['rgba(5,20,10,0.65)', 'rgba(8,28,15,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── HEADER CONTENT ── */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 24, zIndex: 0 }}>
          {/* Greeting */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={s.hdrDate}>{formatDateAr(today)}</Text>
              <Text style={s.hdrGreeting}>مرحباً، {settings.userName} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')} style={s.hdrBtn}>
              <Ionicons name='settings-outline' size={22} color='#fff' />
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={{ paddingTop: 20 }}>
            <Text style={s.hdrBalLabel}>إجمالي رصيدك</Text>
            <Text style={s.hdrBal}>
              {settings.balanceHidden ? '••••••' : formatAmountAr(balance)}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
              {[
                { label: 'مصروف', value: formatAmountAr(expenses), warn: expenses > income * 0.8 },
                { label: '🔥 streak', value: `${maxStreak}` },
                { label: 'مهام', value: `${doneTasks}/${totalTasks}` },
              ].map((item) => (
                <View key={item.label} style={s.statPill}>
                  <Text style={[s.statVal, item.warn && { color: '#FF8A80' }]}>{item.value}</Text>
                  <Text style={s.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── BODY (White Board Overlapping) ── */}
        <View style={{ backgroundColor: Colors.background, borderTopLeftRadius: 36, borderTopRightRadius: 36, minHeight: 800, paddingHorizontal: 16, paddingTop: 24, gap: 14 }}>
          {/* Mood check-in */}
          {!todayMood && (
            <AnimatedCard delay={0}><View style={s.card}><Text style={s.cardTitle}>كيف حالك النهارده؟ 🌤️</Text><MoodPicker onSelect={logMood} /></View></AnimatedCard>
          )}

          {/* Today's tasks */}
          <AnimatedCard delay={60}>
            <View style={s.card}>
              <View style={s.cardRow}>
                <Text style={s.cardTitle}>مهام اليوم</Text>
                <Text style={s.cardMuted}>{doneTasks}/{totalTasks}</Text>
              </View>
              {totalTasks > 0 && <ProgressBar percent={totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0} height={5} style={{ marginTop: 10, marginBottom: 12 }} />}
              {todayTasks.length === 0 ? (
                <Text style={s.emptyText}>يوم فاضي — يلا نضيف مهمة ✨</Text>
              ) : (
                todayTasks.slice(0, 4).map((task) => (
                  <TouchableOpacity key={task.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTask(task.id); }} style={s.taskRow} activeOpacity={0.7}>
                    <View style={[s.taskCheck, task.completed && s.taskCheckDone]}>
                      {task.completed && <Ionicons name='checkmark' size={11} color='#fff' />}
                    </View>
                    <Text style={[s.taskText, task.completed && s.taskTextDone]}>{task.title}</Text>
                    <View style={[s.priorityDot, { backgroundColor: task.priority === 'high' ? Colors.danger : task.priority === 'medium' ? Colors.primaryLight : Colors.primarySoft }]} />
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity onPress={() => setShowAddTask(true)} style={s.addRow} activeOpacity={0.7}>
                <Ionicons name='add' size={18} color={Colors.primaryMid} />
                <Text style={s.addText}>أضف مهمة</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>

          {/* Habits quick check */}
          {todayHabits.length > 0 && (
            <AnimatedCard delay={120}>
              <View style={s.card}>
                <Text style={[s.cardTitle, { marginBottom: 14 }]}>عاداتي اليوم</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                  {todayHabits.map((habit) => {
                    const done = isCompletedToday(habit.id)
                    const targetPerDay = Math.max(1, habit.targetPerDay ?? 1)
                    const todayCount = getCompletedCountToday(habit.id)
                    const streak = getStreak(habit.id)
                    return (
                      <TouchableOpacity key={habit.id} onPress={() => { if (!done) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); checkInHabit(habit.id); } }} activeOpacity={done ? 1 : 0.75} style={{ alignItems: 'center', gap: 6 }}>
                        <View style={[s.habitCircle, done && s.habitCircleDone]}><Text style={{ fontSize: 24 }}>{habit.emoji}</Text></View>
                        <Text style={s.habitName} numberOfLines={1}>{habit.name}</Text>
                        <Text style={s.habitProgress}>{Math.min(todayCount, targetPerDay)}/{targetPerDay}</Text>
                        {streak > 1 && <Text style={s.habitStreak}>🔥{streak}</Text>}
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            </AnimatedCard>
          )}

          {/* Finance summary */}
          <AnimatedCard delay={180}>
            <View style={s.card}>
              <Text style={[s.cardTitle, { marginBottom: 12 }]}>ملخص الشهر</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[s.finPill, { backgroundColor: Colors.primaryXPale }]}>
                  <Text style={s.finPillLabel}>دخل</Text>
                  <Text style={[s.finPillVal, { color: Colors.primaryMid }]}>{formatAmountAr(income)}</Text>
                </View>
                <View style={[s.finPill, { backgroundColor: Colors.dangerLight }]}>
                  <Text style={s.finPillLabel}>مصروف</Text>
                  <Text style={[s.finPillVal, { color: Colors.danger }]}>{formatAmountAr(expenses)}</Text>
                </View>
              </View>
            </View>
          </AnimatedCard>

          {/* Active challenge */}
          {activeChallenge && (
            <AnimatedCard delay={240}>
              <LinearGradient colors={['#2D6A4F', '#1A4731']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ borderRadius: 28, padding: 18, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', top: 0, left: -20, right: -20, height: 60, backgroundColor: 'rgba(116,198,157,0.12)', borderRadius: 9999 }} pointerEvents='none' />
                <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>تحديك الحالي 💪</Text>
                <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 17, color: '#fff', marginBottom: 12 }}>{activeChallenge.title}</Text>
                <ProgressBar percent={(activeChallenge.checkIns.length / activeChallenge.durationDays) * 100} height={6} color='rgba(255,255,255,0.85)' backgroundColor='rgba(255,255,255,0.2)' />
                <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>{activeChallenge.checkIns.length}/{activeChallenge.durationDays} يوم</Text>
              </LinearGradient>
            </AnimatedCard>
          )}

          {/* Daily quote */}
          <AnimatedCard delay={300}>
            <View style={[s.card, { backgroundColor: Colors.surfaceGreen }]}>
              <Text style={s.quoteText}>💬 {quote}</Text>
            </View>
          </AnimatedCard>

        </View>
      </ScrollView>

      {fabOpen && (
        <Pressable
          onPress={() => closeFab()}
          style={fabS.backdrop}
        />
      )}

      {/* ── FAB ── */}
      <View style={fabS.wrap} pointerEvents='box-none'>
        {FAB_ACTIONS.map((item, i) => {
          const translateY = fabItems.interpolate({ inputRange: [0, 1], outputRange: [0, -(56 * (i + 1))] })
          const opacity = fabItems.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] })
          const itemScale = fabItems.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] })
          return (
            <Animated.View key={item.label} pointerEvents={fabOpen ? 'auto' : 'none'} style={[fabS.itemWrap, { transform: [{ translateY }, { scale: itemScale }], opacity }]}>
              <TouchableOpacity
                onPress={item.action}
                activeOpacity={0.85}
                style={fabS.itemTouch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={fabS.itemLabel}>
                  <Text style={fabS.itemLabelText}>{item.label}</Text>
                </View>
                <View style={fabS.itemBtnWrap}>
                  <LinearGradient colors={['#52B788', '#2D6A4F']} style={fabS.itemBtn}>
                    <Ionicons name={item.icon as any} size={22} color='#fff' />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )
        })}

        <Animated.View style={[{ transform: [{ rotate: fabRotation }] }, fabS.mainWrap]}>
          <TouchableOpacity onPress={toggleFab} activeOpacity={0.88} style={fabS.main}>
            <LinearGradient colors={['#52B788', '#1A4731']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fabS.mainGrad}>
              <Ionicons name='add' size={30} color='#fff' />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <AddTaskSheet visible={showAddTask} onClose={() => setShowAddTask(false)} />
      <AddTransactionSheet visible={showAddTx} onClose={() => setShowAddTx(false)} />
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 17, color: Colors.textPrimary },
  cardMuted: { fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textMuted },
  emptyText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  taskCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: Colors.primaryMid, borderColor: Colors.primaryMid },
  taskText: { flex: 1, fontFamily: 'Cairo-SemiBold', fontSize: 15, color: Colors.textPrimary },
  taskTextDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingVertical: 12, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.borderMedium, borderStyle: 'dashed' },
  addText: { fontFamily: 'Cairo-Bold', fontSize: 14, color: Colors.primaryMid },
  habitCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryXPale, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  habitCircleDone: { backgroundColor: Colors.primaryPale, borderColor: Colors.primaryLight },
  habitName: { fontFamily: 'Cairo-SemiBold', fontSize: 11, color: Colors.textSecondary, maxWidth: 54, textAlign: 'center' },
  habitProgress: { fontFamily: 'Cairo-Bold', fontSize: 10, color: Colors.primaryMid },
  habitStreak: { fontFamily: 'Cairo-Bold', fontSize: 10, color: Colors.primaryMid },
  finPill: { flex: 1, borderRadius: 20, padding: 14, gap: 6 },
  finPillLabel: { fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary },
  finPillVal: { fontFamily: 'Cairo-Bold', fontSize: 16 },
  quoteText: { fontFamily: 'Cairo-Medium', fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26, fontStyle: 'italic' },
  hdrDate: { fontFamily: 'Cairo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  hdrGreeting: { fontFamily: 'Cairo-Bold', fontSize: 26, color: '#fff', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  hdrBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  hdrBalLabel: { fontFamily: 'Cairo-Regular', fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 4 },
  hdrBal: { fontFamily: 'Cairo-Bold', fontSize: 40, color: '#fff', letterSpacing: -1.5 },
  statPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  statVal: { fontFamily: 'Cairo-Bold', fontSize: 13, color: '#fff' },
  statLabel: { fontFamily: 'Cairo-Regular', fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
})

const fabS = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(5, 18, 10, 0.18)',
    zIndex: 900,
    elevation: 1,
  },
  wrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 102 : 88,
    left: 20,
    alignItems: 'flex-start',
    zIndex: 1001,
    elevation: 30,
  },
  mainWrap: { shadowColor: Colors.primaryMid, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, zIndex: 3 },
  main: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  mainGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  itemWrap: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10, bottom: 8, zIndex: 2, elevation: 10 },
  itemTouch: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2, paddingHorizontal: 2 },
  itemBtnWrap: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  itemBtn: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  itemLabel: { backgroundColor: 'rgba(13,27,18,0.94)', minWidth: 112, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  itemLabelText: { fontFamily: 'Cairo-Bold', fontSize: 13, color: '#fff', textAlign: 'center' },
})
