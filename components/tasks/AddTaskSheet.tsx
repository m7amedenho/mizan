import { useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Colors } from '@/constants/colors'
import { TASK_CATEGORIES } from '@/constants/categories'
import { useTaskStore } from '@/stores/useTaskStore'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { generateId, getTodayString } from '@/utils/dateHelpers'
import { configureNotifications, scheduleTaskReminder } from '@/utils/notifications'
import { useAppStore } from '@/stores/useAppStore'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'
import type { Priority, Recurrence } from '@/types'

interface Props {
  visible: boolean
  onClose: () => void
}

const PRIORITIES: { key: Priority; label: string }[] = [
  { key: 'high', label: 'عالي' },
  { key: 'medium', label: 'متوسط' },
  { key: 'low', label: 'منخفض' },
]

const RECS: { key: Recurrence; label: string }[] = [
  { key: 'none', label: 'بدون' },
  { key: 'daily', label: 'يومي' },
  { key: 'weekly', label: 'أسبوعي' },
  { key: 'monthly', label: 'شهري' },
]

export function AddTaskSheet({ visible, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask)
  const notificationsEnabled = useAppStore((s) => s.settings.notificationsEnabled)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(getTodayString())
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<'work' | 'personal' | 'learning' | 'health' | 'other'>('personal')
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [subTasksRaw, setSubTasksRaw] = useState('')

  const canSave = useMemo(() => !!title.trim() && !!dueDate.trim(), [title, dueDate])

  const reset = () => {
    setTitle('')
    setDescription('')
    setDueDate(getTodayString())
    setDueTime('')
    setPriority('medium')
    setCategory('personal')
    setRecurrence('none')
    setSubTasksRaw('')
  }

  const save = async () => {
    if (!canSave) return
    const subTasks = subTasksRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((subTitle) => ({ id: generateId(), title: subTitle, completed: false }))

    let notificationId: string | undefined
    if (notificationsEnabled && dueTime.trim()) {
      try {
        const reminderDate = new Date(`${dueDate.trim()}T${dueTime.trim()}:00`)
        if (!Number.isNaN(reminderDate.getTime()) && reminderDate.getTime() > Date.now()) {
          const ok = await configureNotifications()
          if (ok) {
            notificationId = await scheduleTaskReminder('', title.trim(), reminderDate)
          }
        }
      } catch {
        notificationId = undefined
      }
    }

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime.trim() || undefined,
      priority,
      category,
      completed: false,
      subTasks,
      recurrence,
      notificationId,
    })

    reset()
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='إضافة مهمة جديدة' snapPoints={['70%', '94%']}>
      <View style={{ gap: 10 }}>
        <Text style={inputLabel}>عنوان المهمة</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder='عنوان المهمة'
          placeholderTextColor={Colors.textMuted}
          style={[inputStyle, { textAlign: 'right' }]}
        />

        <Text style={inputLabel}>الوصف</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder='وصف (اختياري)'
          placeholderTextColor={Colors.textMuted}
          multiline
          style={[inputStyle, { height: 90, textAlign: 'right', textAlignVertical: 'top', paddingTop: 12 }]}
        />

        <Text style={inputLabel}>التاريخ والوقت</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder='YYYY-MM-DD'
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { flex: 1, textAlign: 'center' }]}
          />
          <TextInput
            value={dueTime}
            onChangeText={setDueTime}
            placeholder='HH:mm'
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { width: 120, textAlign: 'center' }]}
          />
        </View>

        <Text style={inputLabel}>الأولوية</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPriority(p.key)}
              style={{
                flex: 1,
                borderRadius: 20,
                paddingVertical: 9,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: priority === p.key ? Colors.primary : Colors.border,
                backgroundColor: priority === p.key ? Colors.primaryPale : Colors.surface,
              }}
            >
              <Text style={{ fontFamily: 'Cairo-SemiBold', color: priority === p.key ? Colors.primary : Colors.textSecondary }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={inputLabel}>التصنيف</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {TASK_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={{
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: category === c.key ? Colors.primary : Colors.border,
                backgroundColor: category === c.key ? Colors.primaryPale : Colors.surface,
              }}
            >
              <Text style={{ fontFamily: 'Cairo-SemiBold', color: Colors.textPrimary }}>{c.emoji} {c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={inputLabel}>التكرار</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {RECS.map((r) => (
            <TouchableOpacity
              key={r.key}
              onPress={() => setRecurrence(r.key)}
              style={{
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: recurrence === r.key ? Colors.primary : Colors.border,
                backgroundColor: recurrence === r.key ? Colors.primaryPale : Colors.surface,
              }}
            >
              <Text style={{ fontFamily: 'Cairo-SemiBold', color: Colors.textPrimary }}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={inputLabel}>المهام الفرعية</Text>
        <TextInput
          value={subTasksRaw}
          onChangeText={setSubTasksRaw}
          placeholder='مهام فرعية (كل سطر مهمة)'
          placeholderTextColor={Colors.textMuted}
          multiline
          style={[inputStyle, { height: 96, textAlign: 'right', textAlignVertical: 'top', paddingTop: 12 }]}
        />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='حفظ المهمة' onPress={save} disabled={!canSave} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
