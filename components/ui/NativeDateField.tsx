import { useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import DateTimePicker, {
  type DateType,
  useDefaultStyles,
} from 'react-native-ui-datepicker'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { inputLabel, inputStyle } from '@/constants/styles'
import {
  coerceDateValue,
  formatDateAr,
  parseDateString,
  toLocalDateString,
} from '@/utils/dateHelpers'

interface NativeDateFieldProps {
  label: string
  value?: string
  placeholder?: string
  minimumDate?: Date
  maximumDate?: Date
  onChange: (value: string) => void
}

export function NativeDateField({
  label,
  value,
  placeholder = 'اختر التاريخ',
  minimumDate,
  maximumDate,
  onChange,
}: NativeDateFieldProps) {
  const [visible, setVisible] = useState(false)
  const defaultStyles = useDefaultStyles()

  const selectedDate = useMemo(
    () => (value?.trim() ? parseDateString(value) : minimumDate ?? new Date()),
    [minimumDate, value],
  )

  const [draftDate, setDraftDate] = useState<Date>(selectedDate)

  const pickerStyles = useMemo(
    () => ({
      ...defaultStyles,
      selected: {
        ...(defaultStyles.selected ?? {}),
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
      },
      selected_label: {
        ...(defaultStyles.selected_label ?? {}),
        color: Colors.textOnGreen,
        fontFamily: 'Cairo-Bold',
      },
      today: {
        ...(defaultStyles.today ?? {}),
        borderColor: Colors.primaryMid,
        borderWidth: 1,
      },
      today_label: {
        ...(defaultStyles.today_label ?? {}),
        color: Colors.primaryMid,
        fontFamily: 'Cairo-SemiBold',
      },
      month_selector_label: {
        ...(defaultStyles.month_selector_label ?? {}),
        color: Colors.textPrimary,
        fontFamily: 'Cairo-Bold',
      },
      year_selector_label: {
        ...(defaultStyles.year_selector_label ?? {}),
        color: Colors.textPrimary,
        fontFamily: 'Cairo-Bold',
      },
      weekday_label: {
        ...(defaultStyles.weekday_label ?? {}),
        color: Colors.textSecondary,
        fontFamily: 'Cairo-SemiBold',
      },
      day_label: {
        ...(defaultStyles.day_label ?? {}),
        color: Colors.textPrimary,
        fontFamily: 'Cairo-Regular',
      },
      button_next_image: {
        ...(defaultStyles.button_next_image ?? {}),
        tintColor: Colors.primary,
      },
      button_prev_image: {
        ...(defaultStyles.button_prev_image ?? {}),
        tintColor: Colors.primary,
      },
    }),
    [defaultStyles],
  )

  const openPicker = () => {
    setDraftDate(selectedDate)
    setVisible(true)
  }

  const closePicker = () => setVisible(false)

  const confirmSelection = () => {
    onChange(toLocalDateString(draftDate))
    closePicker()
  }

  const handleChange = ({ date }: { date: DateType }) => {
    setDraftDate(coerceDateValue(date, selectedDate))
  }

  return (
    <View>
      <Text style={inputLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={openPicker}
        style={[inputStyle, styles.fieldButton]}
      >
        <Ionicons name='calendar-outline' size={18} color={Colors.primary} />
        <Text
          style={[
            styles.fieldValue,
            { color: value?.trim() ? Colors.textPrimary : Colors.textMuted },
          ]}
        >
          {value?.trim() ? formatDateAr(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={closePicker}
      >
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{label}</Text>
                <Text style={styles.subtitle}>
                  {formatDateAr(draftDate)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closePicker}
                style={styles.iconButton}
                hitSlop={12}
              >
                <Ionicons name='close' size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <DateTimePicker
              mode='single'
              locale='ar-EG'
              numerals='arab'
              styles={pickerStyles}
              date={draftDate}
              minDate={minimumDate}
              maxDate={maximumDate}
              onChange={handleChange}
              timeZone='Africa/Cairo'
              style={styles.picker}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={closePicker}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={[styles.actionText, styles.cancelText]}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSelection}
                style={[styles.actionButton, styles.confirmButton]}
              >
                <Text style={[styles.actionText, styles.confirmText]}>تأكيد</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    textAlign: 'right',
    marginRight: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 18, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryXPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.primaryXPale,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  actionText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
  },
  cancelText: {
    color: Colors.textSecondary,
  },
  confirmText: {
    color: Colors.textOnGreen,
  },
})
