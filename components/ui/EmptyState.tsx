import { View, Text } from 'react-native'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from './PrimaryButton'

interface Props {
  emoji: string
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 }}>
      <Text style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</Text>
      <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>{subtitle}</Text>
      {actionLabel && onAction && <PrimaryButton label={actionLabel} onPress={onAction} size="sm" />}
    </View>
  )
}
