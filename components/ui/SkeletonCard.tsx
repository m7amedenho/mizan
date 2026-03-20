import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { Colors } from '@/constants/colors'

export function SkeletonCard({ height = 80 }: { height?: number }) {
  const anim = useRef(new Animated.Value(0.4)).current
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
    ])).start()
  }, [])
  return <Animated.View style={{ height, borderRadius: 16, backgroundColor: Colors.primaryLight, marginBottom: 12, opacity: anim }} />
}
