import { useEffect, useRef } from 'react'
import { View, Animated, ViewStyle } from 'react-native'
import { Colors } from '@/constants/colors'

interface Props {
  percent: number
  height?: number
  color?: string
  backgroundColor?: string
  borderRadius?: number
  style?: ViewStyle
}

export function ProgressBar({ percent, height = 8, color = Colors.primary, backgroundColor = Colors.primaryLight, borderRadius = 4, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(anim, { toValue: Math.min(percent, 100), useNativeDriver: false, tension: 60, friction: 8 }).start()
  }, [percent])

  return (
    <View style={[{ height, backgroundColor, borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View style={{
        height: '100%', borderRadius, backgroundColor: color,
        width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
      }} />
    </View>
  )
}
