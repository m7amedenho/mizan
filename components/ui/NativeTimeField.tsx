import { useMemo, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { inputLabel, inputStyle } from '@/constants/styles'
import { formatTimeAr, parseTimeString } from '@/utils/dateHelpers'

interface NativeTimeFieldProps {
  label: string
  value?: string
  placeholder?: string
  onChange: (value: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MINUTES = Array.from({ length: 60 }, (_, index) => index)

const pad = (value: number) => value.toString().padStart(2, '0')

export function NativeTimeField({
  label,
  value,
  placeholder = 'اختر الوقت',
  onChange,
}: NativeTimeFieldProps) {
  const [visible, setVisible] = useState(false)

  const selected = useMemo(() => parseTimeString(value?.trim() || '08:00'), [value])
  const [draftHour, setDraftHour] = useState(selected.getHours())
  const [draftMinute, setDraftMinute] = useState(selected.getMinutes())

  const preview = `${pad(draftHour)}:${pad(draftMinute)}`

  const openPicker = () => {
    const next = parseTimeString(value?.trim() || '08:00')
    setDraftHour(next.getHours())
    setDraftMinute(next.getMinutes())
    setVisible(true)
  }

  const closePicker = () => setVisible(false)

  const confirmSelection = () => {
    onChange(preview)
    closePicker()
  }

  return (
    <View>
      <Text style={inputLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={openPicker}
        style={[inputStyle, styles.fieldButton]}
      >
        <Ionicons name='time-outline' size={18} color={Colors.primary} />
        <Text
          style={[
            styles.fieldValue,
            { color: value?.trim() ? Colors.textPrimary : Colors.textMuted },
          ]}
        >
          {value?.trim() ? formatTimeAr(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {visible ? (
        <Modal
          visible
          transparent
          animationType='fade'
          onRequestClose={closePicker}
        >
          <Pressable style={styles.backdrop} onPress={closePicker}>
            <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{label}</Text>
                  <Text style={styles.subtitle}>{formatTimeAr(preview)}</Text>
                </View>
                <TouchableOpacity
                  onPress={closePicker}
                  style={styles.iconButton}
                  hitSlop={12}
                >
                  <Ionicons name='close' size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.columns}>
                <View style={styles.column}>
                  <Text style={styles.columnTitle}>الساعة</Text>
                  <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {HOURS.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        onPress={() => setDraftHour(hour)}
                        style={[
                          styles.option,
                          draftHour === hour && styles.optionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            draftHour === hour && styles.optionTextActive,
                          ]}
                        >
                          {pad(hour)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.column}>
                  <Text style={styles.columnTitle}>الدقيقة</Text>
                  <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {MINUTES.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        onPress={() => setDraftMinute(minute)}
                        style={[
                          styles.option,
                          draftMinute === minute && styles.optionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            draftMinute === minute && styles.optionTextActive,
                          ]}
                        >
                          {pad(minute)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

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
      ) : null}
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
    maxHeight: '84%',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
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
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  list: {
    maxHeight: 320,
    borderRadius: 20,
    backgroundColor: Colors.primaryXPale,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  listContent: {
    padding: 10,
    gap: 8,
  },
  option: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: Colors.textOnGreen,
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
