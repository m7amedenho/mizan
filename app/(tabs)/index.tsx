import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { AddTaskSheet } from "@/components/tasks/AddTaskSheet";
import { AddTransactionSheet } from "@/components/finance/AddTransactionSheet";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useAppStore } from "@/stores/useAppStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useHabitStore } from "@/stores/useHabitStore";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { useGoalStore } from "@/stores/useGoalStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { formatAmountAr, formatDateAr, getTodayString } from "@/utils/dateHelpers";
import { DAILY_QUOTES } from "@/constants/quotes";

const HEADER_BG = require("@/assets/images/header-bg.jpg");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const { settings } = useAppStore();
  const { getTodayTasks, toggleTask } = useTaskStore();
  const { habits, checkInHabit, isCompletedToday, getCompletedCountToday, getStreak } =
    useHabitStore();
  const { getFinanceSummary, getMonthlyExpenses, getMonthlyIncome } = useFinanceStore();
  const { challenges } = useGoalStore();
  const { getTodayMood, logMood } = useMoodStore();

  const today = getTodayString();
  const month = today.slice(0, 7);
  const todayTasks = getTodayTasks();
  const doneTasks = todayTasks.filter((t) => t.completed).length;
  const totalTasks = todayTasks.length;
  const todayMood = getTodayMood();
  const finance = getFinanceSummary();
  const expenses = getMonthlyExpenses(month);
  const income = getMonthlyIncome(month);
  const weekday = new Date().getDay();
  const todayHabits = habits.filter((h) => h.frequency === "daily" || h.days?.includes(weekday));
  const activeChallenge = challenges.find((c) => !c.completed);
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => getStreak(h.id))) : 0;
  const quote = useMemo(
    () => DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length],
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400 }}>
        <ImageBackground source={HEADER_BG} style={{ width: "100%", height: "100%" }}>
          <LinearGradient
            colors={["rgba(5,20,10,0.65)", "rgba(8,28,15,0.92)"]}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 24,
            zIndex: 0,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={s.hdrDate}>{formatDateAr(today)}</Text>
              <Text style={s.hdrGreeting}>مرحبًا، {settings.userName} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/settings")} style={s.hdrBtn}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 20 }}>
            <Text style={s.hdrBalLabel}>رصيد المحافظ</Text>
            <Text style={s.hdrBal}>
              {settings.balanceHidden ? "••••••" : formatAmountAr(finance.walletBalance)}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
              {[
                { label: "المتاح", value: formatAmountAr(finance.availableBalance), warn: false },
                { label: "🔥 streak", value: `${maxStreak}`, warn: false },
                { label: "مهام", value: `${doneTasks}/${totalTasks}`, warn: false },
              ].map((item) => (
                <View key={item.label} style={s.statPill}>
                  <Text style={[s.statVal, item.warn && { color: "#FF8A80" }]}>{item.value}</Text>
                  <Text style={s.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: Colors.background,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            minHeight: 800,
            paddingHorizontal: 16,
            paddingTop: 24,
            gap: 14,
          }}
        >
          {!todayMood && (
            <AnimatedCard delay={0}>
              <View style={s.card}>
                <Text style={s.cardTitle}>كيف حالك النهارده؟ 🌤️</Text>
                <MoodPicker onSelect={logMood} />
              </View>
            </AnimatedCard>
          )}

          <AnimatedCard delay={60}>
            <View style={s.card}>
              <View style={s.cardRow}>
                <Text style={s.cardTitle}>مهام اليوم</Text>
                <Text style={s.cardMuted}>
                  {doneTasks}/{totalTasks}
                </Text>
              </View>
              {totalTasks > 0 && (
                <ProgressBar
                  percent={(doneTasks / totalTasks) * 100}
                  height={5}
                  style={{ marginTop: 10, marginBottom: 12 }}
                />
              )}
              {todayTasks.length === 0 ? (
                <Text style={s.emptyText}>يوم فاضي - يلا نضيف مهمة ✨</Text>
              ) : (
                todayTasks.slice(0, 4).map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleTask(task.id);
                    }}
                    style={s.taskRow}
                    activeOpacity={0.7}
                  >
                    <View style={[s.taskCheck, task.completed && s.taskCheckDone]}>
                      {task.completed && <Ionicons name="checkmark" size={11} color="#fff" />}
                    </View>
                    <Text style={[s.taskText, task.completed && s.taskTextDone]}>{task.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </AnimatedCard>

          {todayHabits.length > 0 && (
            <AnimatedCard delay={120}>
              <View style={s.card}>
                <Text style={[s.cardTitle, { marginBottom: 14 }]}>عاداتي اليوم</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                  {todayHabits.map((habit) => {
                    const done = isCompletedToday(habit.id);
                    const targetPerDay = Math.max(1, habit.targetPerDay ?? 1);
                    const todayCount = getCompletedCountToday(habit.id);
                    const streak = getStreak(habit.id);
                    return (
                      <TouchableOpacity
                        key={habit.id}
                        onPress={() => {
                          if (!done) {
                            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            checkInHabit(habit.id);
                          }
                        }}
                        activeOpacity={done ? 1 : 0.75}
                        style={{ alignItems: "center", gap: 6 }}
                      >
                        <View style={[s.habitCircle, done && s.habitCircleDone]}>
                          <Text style={{ fontSize: 24 }}>{habit.emoji}</Text>
                        </View>
                        <Text style={s.habitName} numberOfLines={1}>
                          {habit.name}
                        </Text>
                        <Text style={s.habitProgress}>
                          {Math.min(todayCount, targetPerDay)}/{targetPerDay}
                        </Text>
                        {streak > 1 && <Text style={s.habitStreak}>🔥{streak}</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </AnimatedCard>
          )}

          <AnimatedCard delay={180}>
            <View style={s.card}>
              <Text style={[s.cardTitle, { marginBottom: 12 }]}>ملخص الأموال</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={[s.finPill, { backgroundColor: Colors.primaryXPale }]}>
                  <Text style={s.finPillLabel}>الدخل</Text>
                  <Text style={[s.finPillVal, { color: Colors.primaryMid }]}>{formatAmountAr(income)}</Text>
                </View>
                <View style={[s.finPill, { backgroundColor: Colors.dangerLight }]}>
                  <Text style={s.finPillLabel}>المصروف</Text>
                  <Text style={[s.finPillVal, { color: Colors.danger }]}>{formatAmountAr(expenses)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={[s.finPill, { backgroundColor: Colors.surfaceGreen }]}>
                  <Text style={s.finPillLabel}>لك عند الناس</Text>
                  <Text style={[s.finPillVal, { color: Colors.success }]}>
                    {formatAmountAr(finance.receivables)}
                  </Text>
                </View>
                <View style={[s.finPill, { backgroundColor: "#FFF3F3" }]}>
                  <Text style={s.finPillLabel}>عليك</Text>
                  <Text style={[s.finPillVal, { color: Colors.danger }]}>
                    {formatAmountAr(finance.payables)}
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedCard>

          {activeChallenge && (
            <AnimatedCard delay={240}>
              <LinearGradient
                colors={["#2D6A4F", "#1A4731"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ borderRadius: 28, padding: 18, overflow: "hidden" }}
              >
                <Text style={{ fontFamily: "Cairo-Bold", fontSize: 17, color: "#fff", marginBottom: 12 }}>
                  {activeChallenge.title}
                </Text>
                <ProgressBar
                  percent={(activeChallenge.checkIns.length / activeChallenge.durationDays) * 100}
                  height={6}
                  color="rgba(255,255,255,0.85)"
                  backgroundColor="rgba(255,255,255,0.2)"
                />
              </LinearGradient>
            </AnimatedCard>
          )}

          <AnimatedCard delay={300}>
            <View style={[s.card, { backgroundColor: Colors.surfaceGreen }]}>
              <Text style={s.quoteText}>💬 {quote}</Text>
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>

      <View style={quickS.wrap}>
        <TouchableOpacity
          onPress={() => setShowQuickActions(true)}
          activeOpacity={0.9}
          style={quickS.btn}
        >
          <LinearGradient colors={["#52B788", "#1A4731"]} style={quickS.grad}>
            <Ionicons name="flash-outline" size={20} color="#fff" />
            <Text style={quickS.txt}>إجراءات سريعة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        title="إجراءات سريعة"
        snapPoints={["35%", "45%"]}
      >
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            style={quickS.action}
            onPress={() => {
              setShowQuickActions(false);
              setShowAddTask(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={quickS.actionText}>إضافة مهمة جديدة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={quickS.action}
            onPress={() => {
              setShowQuickActions(false);
              setShowAddTx(true);
            }}
          >
            <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
            <Text style={quickS.actionText}>إضافة عملية مالية</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={quickS.action}
            onPress={() => {
              setShowQuickActions(false);
              router.push("/(tabs)/finance");
            }}
          >
            <Ionicons name="analytics-outline" size={20} color={Colors.primary} />
            <Text style={quickS.actionText}>فتح لوحة المال الكاملة</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <AddTaskSheet visible={showAddTask} onClose={() => setShowAddTask(false)} />
      <AddTransactionSheet visible={showAddTx} onClose={() => setShowAddTx(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontFamily: "Cairo-Bold", fontSize: 17, color: Colors.textPrimary },
  cardMuted: { fontFamily: "Cairo-Regular", fontSize: 14, color: Colors.textMuted },
  emptyText: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    paddingVertical: 10,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  taskCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCheckDone: { backgroundColor: Colors.primaryMid, borderColor: Colors.primaryMid },
  taskText: { flex: 1, fontFamily: "Cairo-SemiBold", fontSize: 15, color: Colors.textPrimary },
  taskTextDone: { textDecorationLine: "line-through", color: Colors.textMuted },
  habitCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryXPale,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  habitCircleDone: { backgroundColor: Colors.primaryPale, borderColor: Colors.primaryLight },
  habitName: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 11,
    color: Colors.textSecondary,
    maxWidth: 54,
    textAlign: "center",
  },
  habitProgress: { fontFamily: "Cairo-Bold", fontSize: 10, color: Colors.primaryMid },
  habitStreak: { fontFamily: "Cairo-Bold", fontSize: 10, color: Colors.primaryMid },
  finPill: { flex: 1, borderRadius: 20, padding: 14, gap: 6 },
  finPillLabel: { fontFamily: "Cairo-Regular", fontSize: 12, color: Colors.textSecondary },
  finPillVal: { fontFamily: "Cairo-Bold", fontSize: 16 },
  quoteText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
  },
  hdrDate: { fontFamily: "Cairo-Regular", fontSize: 14, color: "rgba(255,255,255,0.72)" },
  hdrGreeting: {
    fontFamily: "Cairo-Bold",
    fontSize: 26,
    color: "#fff",
    marginTop: 2,
  },
  hdrBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  hdrBalLabel: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 4,
  },
  hdrBal: { fontFamily: "Cairo-Bold", fontSize: 40, color: "#fff", letterSpacing: -1.5 },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  statVal: { fontFamily: "Cairo-Bold", fontSize: 13, color: "#fff" },
  statLabel: {
    fontFamily: "Cairo-Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
});

const quickS = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 90,
    left: 20,
    zIndex: 50,
  },
  btn: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: Colors.primaryMid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  grad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  txt: { fontFamily: "Cairo-Bold", fontSize: 13, color: "#fff" },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionText: { fontFamily: "Cairo-SemiBold", fontSize: 14, color: Colors.textPrimary },
});

