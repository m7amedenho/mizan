import { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { Task } from '@/types'
import { Colors } from '@/constants/colors'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateAr } from '@/utils/dateHelpers'

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onDelete: () => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const priorityColor = useMemo(() => {
    if (task.priority === 'high') return Colors.priorityHigh
    if (task.priority === 'medium') return Colors.priorityMedium
    return Colors.priorityLow
  }, [task.priority])

  const rightAction = () => (
    <TouchableOpacity
      onPress={onDelete}
      style={{
        width: 88,
        marginVertical: 2,
        borderRadius: 16,
        backgroundColor: Colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="trash" size={20} color="#fff" />
      <Text style={{ color: '#fff', fontFamily: 'Cairo-SemiBold', fontSize: 12, marginTop: 4 }}>حذف</Text>
    </TouchableOpacity>
  )

  return (
    <Swipeable renderRightActions={rightAction} overshootRight={false}>
      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <TouchableOpacity onPress={onToggle} style={{ marginTop: 2 }}>
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={task.completed ? Colors.success : Colors.textMuted}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'Cairo-SemiBold',
                fontSize: 15,
                color: task.completed ? Colors.textMuted : Colors.textPrimary,
                textDecorationLine: task.completed ? 'line-through' : 'none',
                writingDirection: 'rtl',
              }}
            >
              {task.title}
            </Text>

            {!!task.description && (
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2, writingDirection: 'rtl' }}>
                {task.description}
              </Text>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textMuted }}>
                {formatDateAr(task.dueDate)}
              </Text>
              <Badge label={task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'} color={priorityColor} bgColor={`${priorityColor}22`} />
            </View>

            {task.subTasks.length > 0 && (
              <View style={{ marginTop: 10, gap: 6 }}>
                {task.subTasks.map((sub) => (
                  <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={sub.completed ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={sub.completed ? Colors.success : Colors.textMuted} />
                    <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary, writingDirection: 'rtl', flex: 1 }}>
                      {sub.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>
    </Swipeable>
  )
}
