import { useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Colors } from '@/constants/colors'
import { HABIT_EMOJIS } from '@/constants/categories'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useHabitStore } from '@/stores/useHabitStore'
import { configureNotifications, scheduleHabitReminder } from '@/utils/notifications'
import { useAppStore } from '@/stores/useAppStore'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

interface Props {
  visible: boolean
  onClose: () => void
}

export function AddHabitSheet({ visible, onClose }: Props) {
  const addHabit = useHabitStore((s) => s.addHabit)
  const notificationsEnabled = useAppStore((s) => s.settings.notificationsEnabled)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💪')
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily')
  const [daysRaw, setDaysRaw] = useState('0,1,2,3,4,5,6')
  const [reminderTime, setReminderTime] = useState('')

  const canSave = useMemo(() => !!name.trim(), [name])

  const reset = () => {
    setName('')
    setEmoji('💪')
    setFrequency('daily')
    setDaysRaw('0,1,2,3,4,5,6')
    setReminderTime('')
  }

  const save = async () => {
    if (!canSave) return
    const days = frequency === 'specific_days'
      ? daysRaw.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
      : undefined

    let notificationId: string | undefined
    if (notificationsEnabled && frequency === 'daily' && reminderTime.trim()) {
      const [h, m] = reminderTime.trim().split(':').map((v) => Number(v))
      if (!Number.isNaN(h) && !Number.isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        try {
          const ok = await configureNotifications()
          if (ok) {
            notificationId = await scheduleHabitReminder('', name.trim(), h, m)
          }
        } catch {
          notificationId = undefined
        }
      }
    }

    addHabit({
      name: name.trim(),
      emoji,
      frequency,
      days: frequency === 'specific_days' ? days : undefined,
      reminderTime: reminderTime.trim() || undefined,
      notificationId,
    })

    reset()
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='إضافة عادة جديدة' snapPoints={['65%', '92%']}>
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
          {HABIT_EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => setEmoji(e)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: emoji === e ? Colors.primary : Colors.border,
                backgroundColor: emoji === e ? Colors.primaryPale : Colors.surface,
              }}
            >
              <Text style={{ fontSize: 20 }}>{e}</Text>
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

        {frequency === 'specific_days' && (
          <TextInput
            value={daysRaw}
            onChangeText={setDaysRaw}
            placeholder='مثال: 0,2,4,6'
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { textAlign: 'left' }]}
          />
        )}

        <Text style={inputLabel}>وقت التذكير</Text>
        <TextInput
          value={reminderTime}
          onChangeText={setReminderTime}
          placeholder='HH:mm (اختياري)'
          placeholderTextColor={Colors.textMuted}
          style={[inputStyle, { textAlign: 'center' }]}
        />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='حفظ العادة' onPress={save} disabled={!canSave} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
