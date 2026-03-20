import { View, Text, ViewStyle } from 'react-native'
import { Colors } from '@/constants/colors'

interface Props {
  label: string
  color?: string
  bgColor?: string
  size?: 'sm' | 'md'
  style?: ViewStyle
}

export function Badge({ label, color = Colors.primary, bgColor = Colors.primaryLight, size = 'sm', style }: Props) {
  return (
    <View style={[{ backgroundColor: bgColor, borderRadius: 20, paddingHorizontal: size === 'sm' ? 8 : 12, paddingVertical: size === 'sm' ? 3 : 5, alignSelf: 'flex-start' }, style]}>
      <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: size === 'sm' ? 11 : 13, color }}>{label}</Text>
    </View>
  )
}
