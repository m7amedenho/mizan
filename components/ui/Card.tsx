import { View, ViewStyle, StyleSheet } from 'react-native'

interface Props {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  noPadding?: boolean
  variant?: 'white' | 'green' | 'pale'
}

export function Card({ children, style, noPadding, variant = 'white' }: Props) {
  const bg = {
    white: '#FFFFFF',
    green: '#1A4731',
    pale:  '#F0FAF3',
  }[variant]

  return (
    <View style={[{
      backgroundColor: bg,
      borderRadius: 28,
      padding: noPadding ? 0 : 16,
      borderWidth: variant === 'white' ? 1 : 0,
      borderColor: '#E2EAE4',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }, style]}>
      {children}
    </View>
  )
}
