import { useEffect, useRef } from 'react'
import { Animated, ViewStyle } from 'react-native'

export function AnimatedCard({
  children, delay = 0, style,
}: {
  children: React.ReactNode
  delay?: number
  style?: ViewStyle | ViewStyle[]
}) {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(16)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 300,
        delay, useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, delay,
        speed: 18, bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[
      { opacity, transform: [{ translateY }] },
      style,
    ]}>
      {children}
    </Animated.View>
  )
}
