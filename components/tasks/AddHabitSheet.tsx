import { useMemo, useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { HABIT_EMOJIS } from '@/constants/categories'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useHabitStore } from '@/stores/useHabitStore'
import { configureNotifications, scheduleHabitReminders } from '@/utils/notifications'
import { useAppStore } from '@/stores/useAppStore'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'
import { NativeTimeField } from '@/components/ui/NativeTimeField'

interface Props {
  visible: boolean
  onClose: () => void
}

export function AddHabitSheet({ visible, onClose }: Props) {
  const addHabit = useHabitStore((state) => state.addHabit)
  const notificationsEnabled = useAppStore((state) => state.settings.notificationsEnabled)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💪')
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily')
  const [daysRaw, setDaysRaw] = useState('0,1,2,3,4,5,6')
  const [targetPerDay, setTargetPerDay] = useState(1)
  const [draftReminderTime, setDraftReminderTime] = useState('')
  const [reminderTimes, setReminderTimes] = useState<string[]>([])

  const canSave = useMemo(() => !!name.trim(), [name])

  const reset = () => {
    setName('')
    setEmoji('💪')
    setFrequency('daily')
    setDaysRaw('0,1,2,3,4,5,6')
    setTargetPerDay(1)
    setDraftReminderTime('')
    setReminderTimes([])
  }

  const addReminderTime = () => {
    if (!draftReminderTime.trim()) return
    setReminderTimes((previous) =>
      previous.includes(draftReminderTime.trim())
        ? previous
        : [...previous, draftReminderTime.trim()].sort(),
    )
    setDraftReminderTime('')
  }

  const removeReminderTime = (time: string) => {
    setReminderTimes((previous) => previous.filter((item) => item !== time))
  }

  const save = async () => {
    if (!canSave) return

    const days = frequency === 'specific_days'
      ? daysRaw.split(',').map((value) => Number(value.trim())).filter((day) => !Number.isNaN(day) && day >= 0 && day <= 6)
      : undefined

    const finalReminderTimes = [
      ...reminderTimes,
      ...(draftReminderTime.trim() && !reminderTimes.includes(draftReminderTime.trim()) ? [draftReminderTime.trim()] : []),
    ].sort()

    let notificationIds: string[] | undefined
    if (notificationsEnabled && frequency === 'daily' && finalReminderTimes.length > 0) {
      try {
        const ok = await configureNotifications()
        if (ok) {
          notificationIds = await scheduleHabitReminders('', name.trim(), finalReminderTimes)
        }
      } catch {
        notificationIds = undefined
      }
    }

    addHabit({
      name: name.trim(),
      emoji,
      frequency,
      days: frequency === 'specific_days' ? days : undefined,
      targetPerDay,
      reminderTime: finalReminderTimes[0],
      reminderTimes: finalReminderTimes,
      notificationId: notificationIds?.[0],
      notificationIds,
    })

    reset()
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='إضافة عادة جديدة' snapPoints={['82%', '98%']}>
      <View style={{ gap: 10 }}>
        <Text style={inputLabel}>اسم العادة</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder='اسم العادة'
          placeholderTextColor={Colors.textMuted}
          style={[inputStyle, { textAlign: 'right' }]}
        />

        <Text style={inputLabel}>اختر إيموجي</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {HABIT_EMOJIS.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setEmoji(item)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: emoji === item ? Colors.primary : Colors.border,
                backgroundColor: emoji === item ? Colors.primaryPale : Colors.surface,
              }}
            >
              <Text style={{ fontSize: 20 }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={inputLabel}>التكرار</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setFrequency('daily')}
            style={{
              flex: 1,
              borderRadius: 20,
              paddingVertical: 9,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: frequency === 'daily' ? Colors.primary : Colors.border,
              backgroundColor: frequency === 'daily' ? Colors.primaryPale : Colors.surface,
            }}
          >
            <Text style={{ fontFamily: 'Cairo-SemiBold', color: Colors.textPrimary }}>يومي</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFrequency('specific_days')}
            style={{
              flex: 1,
              borderRadius: 20,
              paddingVertical: 9,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: frequency === 'specific_days' ? Colors.primary : Colors.border,
              backgroundColor: frequency === 'specific_days' ? Colors.primaryPale : Colors.surface,
            }}
          >
            <Text style={{ fontFamily: 'Cairo-SemiBold', color: Colors.textPrimary }}>أيام محددة</Text>
          </TouchableOpacity>
        </View>

        {frequency === 'specific_days' ? (
          <TextInput
            value={daysRaw}
            onChangeText={setDaysRaw}
            placeholder='مثال: 0,2,4,6'
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { textAlign: 'left' }]}
          />
        ) : null}

        <Text style={inputLabel}>عدد مرات العادة في اليوم</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((count) => (
            <TouchableOpacity
              key={count}
              onPress={() => setTargetPerDay(count)}
              style={{
                flex: 1,
                borderRadius: 18,
                paddingVertical: 10,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: targetPerDay === count ? Colors.primary : Colors.border,
                backgroundColor: targetPerDay === count ? Colors.primaryPale : Colors.surface,
              }}
            >
              <Text style={{ fontFamily: 'Cairo-Bold', color: targetPerDay === count ? Colors.primary : Colors.textSecondary }}>
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <NativeTimeField
          label='أضف وقت تذكير'
          value={draftReminderTime}
          onChange={setDraftReminderTime}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textMuted }}>
            تقدر تضيف أكثر من وقت لنفس العادة في اليوم
          </Text>
          <TouchableOpacity
            onPress={addReminderTime}
            disabled={!draftReminderTime.trim()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: draftReminderTime.trim() ? Colors.primaryPale : Colors.primaryXPale,
              opacity: draftReminderTime.trim() ? 1 : 0.6,
            }}
          >
            <Ionicons name='add' size={16} color={Colors.primary} />
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 12, color: Colors.primary }}>إضافة الوقت</Text>
          </TouchableOpacity>
        </View>

        {reminderTimes.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {reminderTimes.map((time) => (
              <View
                key={time}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: Colors.primaryXPale,
                  borderWidth: 1,
                  borderColor: Colors.borderLight,
                }}
              >
                <TouchableOpacity onPress={() => removeReminderTime(time)} hitSlop={8}>
                  <Ionicons name='close' size={15} color={Colors.danger} />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: Colors.textPrimary }}>{time}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='حفظ العادة' onPress={save} disabled={!canSave} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
