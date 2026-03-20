import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { NAV_BOTTOM_PADDING } from '@/constants/design'
import { GradientHeader } from '@/components/ui/GradientHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { TaskItem } from '@/components/tasks/TaskItem'
import { HabitCard } from '@/components/tasks/HabitCard'
import { PomodoroTimer } from '@/components/tasks/PomodoroTimer'
import { AddTaskSheet } from '@/components/tasks/AddTaskSheet'
import { AddHabitSheet } from '@/components/tasks/AddHabitSheet'
import { useTaskStore } from '@/stores/useTaskStore'
import { useHabitStore } from '@/stores/useHabitStore'

type Tab = 'tasks' | 'habits' | 'pomodoro'
type Filter = 'today' | 'tomorrow' | 'week' | 'all' | 'done'

const FILTERS = [
  { key: 'today' as Filter, label: 'اليوم' },
  { key: 'tomorrow' as Filter, label: 'غداً' },
  { key: 'week' as Filter, label: 'الأسبوع' },
  { key: 'all' as Filter, label: 'الكل' },
  { key: 'done' as Filter, label: 'المكتملة' },
]

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [filter, setFilter] = useState<Filter>('today')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const { tasks, getTodayTasks, toggleTask, deleteTask } = useTaskStore()
  const { habits } = useHabitStore()

  const getFiltered = () => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    switch (filter) {
      case 'today':
        return tasks.filter((t) => t.dueDate.startsWith(today) && !t.completed)
      case 'tomorrow':
        return tasks.filter((t) => t.dueDate.startsWith(tomorrow))
      case 'week':
        return tasks.filter((t) => t.dueDate >= today && t.dueDate <= weekEnd && !t.completed)
      case 'all':
        return tasks.filter((t) => !t.completed)
      case 'done':
        return tasks.filter((t) => t.completed)
    }
  }

  const filtered = getFiltered()
  const todayCount = getTodayTasks().filter((t) => !t.completed).length

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <GradientHeader
        title='مهامـي'
        subtitle={`${todayCount} مهمة متبقية لليوم`}
        rightAction={{
          icon: 'add-outline',
          onPress: () => activeTab === 'tasks' ? setShowAddTask(true) : setShowAddHabit(true),
        }}
      />

      <View style={{ flex: 1, backgroundColor: Colors.background, marginTop: -24, borderTopLeftRadius: 36, borderTopRightRadius: 36 }}>
        <View style={s.tabContainer}>
          {([
            ['tasks', 'المهام'],
            ['habits', 'العادات'],
            ['pomodoro', 'البومودورو'],
          ] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.8}
              style={[
                s.tabBtn,
                activeTab === key && s.tabBtnActive,
              ]}
            >
              <Text style={[
                s.tabLabel,
                activeTab === key && s.tabLabelActive,
              ]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'tasks' && (
          <View style={{ flex: 1 }}>
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterRow}
              >
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    activeOpacity={0.75}
                    style={[
                      s.filterChip,
                      filter === f.key && s.filterChipActive,
                    ]}
                  >
                    <Text style={[
                      s.filterLabel,
                      filter === f.key && s.filterLabelActive,
                    ]}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {filtered.length === 0
              ? <EmptyState emoji='✨' title='الروقان التام!' subtitle='مفيش مهام حالياً، تقدر تخطط ليومك' actionLabel='+ إضافة مهمة جديدة' onAction={() => setShowAddTask(true)} />
              : <ScrollView
                  contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: NAV_BOTTOM_PADDING + 80 }}
                  showsVerticalScrollIndicator={false}
                >
                  {filtered.map((task, i) => (
                    <AnimatedCard key={task.id} delay={Math.min(i * 65, 350)}>
                      <TaskItem task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
                    </AnimatedCard>
                  ))}
                </ScrollView>
            }
          </View>
        )}

        {activeTab === 'habits' && (
          <View style={{ flex: 1, paddingTop: 6 }}>
            {habits.length === 0
              ? <EmptyState emoji='🌱' title='ابني عاداتك!' subtitle='خطوة بخطوة هتوصل لأحسن نسخة منك' actionLabel='+ أضف أول عادة' onAction={() => setShowAddHabit(true)} />
              : <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: NAV_BOTTOM_PADDING + 80 }} showsVerticalScrollIndicator={false}>
                  {habits.map((habit, i) => (
                    <AnimatedCard key={habit.id} delay={Math.min(i * 65, 350)}>
                      <HabitCard habit={habit} />
                    </AnimatedCard>
                  ))}
                </ScrollView>
            }
          </View>
        )}

        {activeTab === 'pomodoro' && (
           <View style={{ flex: 1 }}>
              <PomodoroTimer />
           </View>
        )}
      </View>

      <AddTaskSheet visible={showAddTask} onClose={() => setShowAddTask(false)} />
      <AddHabitSheet visible={showAddHabit} onClose={() => setShowAddHabit(false)} />
    </View>
  )
}

const s = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: Colors.primaryXPale,
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: '#fff',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  filterLabel: {
    fontFamily: 'Cairo-Bold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: '#fff',
  },
})
