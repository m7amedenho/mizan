import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ImageBackground } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const HEADER_BG = require('@/assets/images/header-bg.jpg')

interface Props {
  title: string
  subtitle?: string
  rightAction?: { icon: any; onPress: () => void }
  leftAction?: { icon: any; onPress: () => void }
}

export function GradientHeader({ title, subtitle, rightAction, leftAction }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <ImageBackground source={HEADER_BG} style={[s.bgWrap, { paddingTop: insets.top + 16 }]}>
      <LinearGradient
        colors={['rgba(5,20,10,0.65)', 'rgba(8,28,15,0.92)']}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={s.row}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} style={s.btn}>
            <Ionicons name={leftAction.icon} size={20} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={s.btn}>
            <Ionicons name={rightAction.icon} size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  )
}

const s = StyleSheet.create({
  bgWrap: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    overflow: 'hidden',
    backgroundColor: '#1A4731',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
  btn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
})
