import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useProjectStore } from '@/stores/useProjectStore'
import { PROJECT_CATEGORIES } from '@/constants/categories'
import { ProjectCategory, ProjectStatus } from '@/types'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { inputLabel, inputStyle } from '@/constants/styles'

export function AddProjectSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('personal')
  const [status, setStatus] = useState<ProjectStatus>('idea')
  const { addProject } = useProjectStore()

  const handleSave = () => {
    if (!title.trim()) return
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addProject({ title: title.trim(), description, category, status, steps: [], goalId: undefined, startedAt: status === 'active' ? new Date().toISOString() : undefined })
    setTitle(''); setDescription(''); setCategory('personal'); setStatus('idea')
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title='مشروع جديد' snapPoints={['70%', '94%']}>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={inputLabel}>اسم المشروع *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder='إيه اسم مشروعك؟' placeholderTextColor={Colors.textMuted} style={[inputStyle, { textAlign: 'right' }]} autoFocus />
        </View>
        <View>
          <Text style={inputLabel}>الوصف</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder='فكرة عامة عن المشروع...' placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} style={[inputStyle, { height: 80, textAlignVertical: 'top', paddingTop: 12, textAlign: 'right' }]} />
        </View>
        <View>
          <Text style={inputLabel}>التصنيف</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PROJECT_CATEGORIES.map((c) => (
              <TouchableOpacity key={c.key} onPress={() => setCategory(c.key)}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: category === c.key ? Colors.primaryPale : Colors.surface, borderWidth: 1, borderColor: category === c.key ? Colors.primary : Colors.border, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: category === c.key ? Colors.primary : Colors.textSecondary }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View>
          <Text style={inputLabel}>الحالة</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([['idea', '💡 فكرة'], ['active', '🚀 شغال']] as const).map(([key, label]) => (
              <TouchableOpacity key={key} onPress={() => setStatus(key)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: status === key ? Colors.primaryPale : Colors.surface, borderWidth: 1, borderColor: status === key ? Colors.primary : Colors.border, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: status === key ? Colors.primary : Colors.textSecondary }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <PrimaryButton label='إلغاء' variant='outline' onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label='💾 حفظ المشروع' onPress={handleSave} disabled={!title.trim()} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  )
}
