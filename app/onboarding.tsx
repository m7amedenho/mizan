import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Image, Dimensions
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeIn, FadeOut, withRepeat, withTiming, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Colors, Gradients } from '@/constants/colors'
import { useAppStore } from '@/stores/useAppStore'

const { width, height } = Dimensions.get('window')

const STEPS = [
  {
    isLogo: true,
    title: 'أهلاً بيك في ميزان',
    subtitle: 'تطبيقك الشخصي للإنتاجية\nوتنظيم الوقت والمال',
  },
  {
    title: 'نظم مهامك وعاداتك',
    subtitle: 'تابع كل حاجة بتعملها\nوحافظ على تركيزك كل يوم',
  },
  {
    title: 'سيطر على فلوسك',
    subtitle: 'سجل مصاريفك، تابع ديونك\nوخطط لميزانيتك بسهولة',
  },
  {
    title: 'يلا نبدأ معاك',
    subtitle: 'اكتب اسمك وابدأ رحلتك',
    hasInput: true,
  },
]
const StaticLogo = () => {
  return (
    <View style={{
      width: 220, height: 220,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 32,
    }}>
      <Image
        source={require('@/assets/splash-icon.png')}
        style={{ width: 220, height: 220 }}
        resizeMode="contain"
      />
    </View>
  )
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  
  const insets = useSafeAreaInsets()
  const updateSettings = useAppStore((s) => s.updateSettings)
  const current = STEPS[step]

  const next = () => {
    if (step < STEPS.length - 1) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setStep((s) => s + 1)
    }
  }

  const back = () => {
    if (step > 0) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setStep((s) => s - 1)
    }
  }

  const finish = () => {
    if (!name.trim()) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    updateSettings({ userName: name.trim(), isOnboarded: true })
    router.replace('/(tabs)')
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Decorative Background Blob */}
      <View style={{
        position: 'absolute',
        top: -height * 0.15,
        left: -width * 0.2,
        width: width * 1.4,
        height: width * 1.4,
        borderRadius: width * 0.7,
        backgroundColor: Colors.primaryXPale,
        opacity: 0.6,
      }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 32,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          keyboardShouldPersistTaps='handled'
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section: Indicators */}
          <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
            <View style={{
              flexDirection: 'row', gap: 8,
              paddingVertical: 12, paddingHorizontal: 16,
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: 20,
            }}>
              {STEPS.map((_, i) => (
                <Animated.View
                  key={i}
                  style={{
                    height: 6, borderRadius: 3,
                    width: i === step ? 28 : 8,
                    backgroundColor: i === step
                      ? Colors.primaryMid
                      : Colors.borderMedium,
                  }}
                />
              ))}
            </View>
          </View>

          {/* Middle Section: Content */}
          <Animated.View
            key={`content-${step}`}
            entering={FadeInDown.duration(400).springify().damping(16).stiffness(100)}
            style={{ alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' }}
          >
            {current.isLogo && <StaticLogo />}

            <Text style={{
              fontFamily: 'Cairo-Bold',
              fontSize: 26, lineHeight: 36,
              color: Colors.textPrimary,
              textAlign: 'center',
              marginBottom: 12,
            }}>{current.title}</Text>

            <Text style={{
              fontFamily: 'Cairo-Medium',
              fontSize: 16, lineHeight: 26,
              color: Colors.textSecondary,
              textAlign: 'center',
              marginBottom: current.hasInput ? 32 : 0,
              paddingHorizontal: 20,
            }}>{current.subtitle}</Text>

            {current.hasInput && (
              <Animated.View 
                entering={FadeInDown.delay(200).duration(400).springify()}
                style={{ width: '100%' }}
              >
                <View style={{
                  width: '100%', height: 64,
                  borderRadius: 20,
                  backgroundColor: Colors.surface,
                  borderWidth: 2,
                  borderColor: isFocused ? Colors.primary : Colors.borderLight,
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 20,
                  shadowColor: isFocused ? Colors.primary : Colors.textPrimary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isFocused ? 0.15 : 0.04,
                  shadowRadius: 16,
                  elevation: 4,
                }}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder='اكتب اسمك هنا...'
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType='done'
                    onSubmitEditing={finish}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      fontFamily: 'Cairo-Bold', fontSize: 18,
                      color: Colors.textPrimary,
                      textAlign: 'right',
                    }}
                  />
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Bottom Section: Actions */}
          <View style={{ width: '100%', gap: 16, paddingBottom: 10 }}>
            {step < STEPS.length - 1 ? (
              <TouchableOpacity
                onPress={next}
                activeOpacity={0.8}
                style={{
                  height: 64, borderRadius: 32,
                  shadowColor: Colors.primaryMid,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={Gradients.buttonPrimary}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1, alignItems: 'center', borderRadius: 32,
                    justifyContent: 'center', flexDirection: 'row', gap: 12,
                  }}
                >
                  <Text style={{
                    fontFamily: 'Cairo-Bold', fontSize: 20, color: '#fff',
                    marginTop: -4, // Adjust for Cairo font baseline
                  }}>التالي</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 22, marginTop: -4 }}>←</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={finish}
                disabled={!name.trim()}
                activeOpacity={0.8}
                style={{
                  height: 64, borderRadius: 32,
                  shadowColor: Colors.primaryMid,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: name.trim() ? 0.3 : 0,
                  shadowRadius: 16,
                  elevation: name.trim() ? 8 : 0,
                  opacity: name.trim() ? 1 : 0.5,
                }}
              >
                <LinearGradient
                  colors={Gradients.buttonPrimary}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1, alignItems: 'center', borderRadius: 32,
                    justifyContent: 'center', flexDirection: 'row', gap: 12,
                  }}
                >
                  <Text style={{
                    fontFamily: 'Cairo-Bold', fontSize: 20, color: '#fff',
                    marginTop: -4,
                  }}>يلا نبدأ 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={{ height: 30, alignItems: 'center', justifyContent: 'center' }}>
              {step > 0 && (
                <TouchableOpacity
                  onPress={back}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={{
                    fontFamily: 'Cairo-Medium', fontSize: 16,
                    color: Colors.textMuted,
                  }}>→ رجوع</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

