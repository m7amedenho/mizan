import { useRef } from 'react'
import {
  Text, ViewStyle, TouchableOpacity, View,
  ActivityIndicator, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'

interface Props {
  label: string
  onPress: () => void
  variant?: 'filled' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle | ViewStyle[]
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function PrimaryButton({
  label, onPress, variant = 'filled',
  size = 'md', loading, disabled,
  style, icon, fullWidth = true,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current

  const pressIn = () => Animated.spring(scale, {
    toValue: 0.97,
    useNativeDriver: true,
    speed: 60, bounciness: 0,
  }).start()

  const pressOut = () => Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: true,
    speed: 40, bounciness: 5,
  }).start()

  const heights   = { sm: 42, md: 52, lg: 58 }
  const fontSizes = { sm: 14, md: 16, lg: 17 }

  const stylesObj = {
    filled:  { bg: '#2D6A4F', text: '#FFFFFF', border: 'transparent' },
    outline: { bg: 'transparent', text: '#2D6A4F', border: '#2D6A4F' },
    ghost:   { bg: 'transparent', text: '#4A5C52', border: 'transparent' },
    danger:  { bg: '#DC2626', text: '#FFFFFF', border: 'transparent' },
  }[variant]

  return (
    <Animated.View style={[
      {
        transform: [{ scale }],
        borderRadius: 24,
        opacity: disabled ? 0.45 : 1,
      },
      fullWidth && { width: '100%' },
      style,
    ]}>
      <TouchableOpacity
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            onPress()
          }
        }}
        disabled={disabled || loading}
        activeOpacity={1}
        style={{
          height: heights[size],
          borderRadius: 24,
          backgroundColor: stylesObj.bg,
          borderWidth: stylesObj.border === 'transparent' ? 0 : 1.5,
          borderColor: stylesObj.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: 24,
        }}
      >
        {loading
          ? <ActivityIndicator color={stylesObj.text} size="small" />
          : <>{icon}<Text style={{
              fontFamily: 'Cairo-Bold',
              fontSize: fontSizes[size],
              color: stylesObj.text,
            }}>{label}</Text></>
        }
      </TouchableOpacity>
    </Animated.View>
  )
}
