import { useEffect, useState } from 'react'
import { I18nManager, View, Text, Image } from 'react-native'
import { Stack, router } from 'expo-router'
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import Animated, { FadeOut, FadeIn } from 'react-native-reanimated'
import { useTaskStore } from '@/stores/useTaskStore'
import { useAppStore } from '@/stores/useAppStore'
import { Colors } from '@/constants/colors'

I18nManager.forceRTL(true)
I18nManager.allowRTL(true)
SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': Cairo_400Regular,
    'Cairo-SemiBold': Cairo_600SemiBold,
    'Cairo-Bold': Cairo_700Bold,
  })

  const [showSplash, setShowSplash] = useState(true)

  const generateRecurring = useTaskStore((s) => s.generateRecurring)
  const isOnboarded = useAppStore((s) => s.settings.isOnboarded)

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
      let idleId: number | undefined
      let timeoutId: ReturnType<typeof setTimeout> | undefined

      if (typeof globalThis.requestIdleCallback === 'function') {
        idleId = globalThis.requestIdleCallback(() => {
          generateRecurring()
        })
      } else {
        timeoutId = setTimeout(() => {
          generateRecurring()
        }, 16)
      }
      
      const timer = setTimeout(() => {
        if (!isOnboarded) router.replace('/onboarding')
        setShowSplash(false)
      }, 2500)
      
      return () => {
        clearTimeout(timer)
        if (typeof idleId === 'number' && typeof globalThis.cancelIdleCallback === 'function') {
          globalThis.cancelIdleCallback(idleId)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }, [fontsLoaded, isOnboarded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 220,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name='onboarding' options={{ animation: 'fade' }} />
          <Stack.Screen name='(tabs)' options={{ animation: 'none' }} />
          <Stack.Screen name='settings' options={{ animation: 'slide_from_right' }} />
        </Stack>

        {showSplash && (
          <Animated.View 
            exiting={FadeOut.duration(800)} 
            style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: Colors.background, 
              alignItems: 'center', justifyContent: 'center',
              zIndex: 999 
            }}
          >
            <Animated.Image 
              entering={FadeIn.duration(800)}
              source={require('@/assets/splash-icon.png')} 
              style={{ width: 180, height: 180 }} 
              resizeMode="contain" 
            />
            
            <Animated.View 
              entering={FadeIn.delay(400).duration(800)}
              style={{ position: 'absolute', bottom: 60, alignItems: 'center' }}
            >
              <Text style={{ 
                fontFamily: 'Cairo-Bold', 
                fontSize: 24, 
                color: Colors.primary,
                letterSpacing: 1,
              }}>
                Mizan App
              </Text>
              <Text style={{ 
                fontFamily: 'Cairo-SemiBold', 
                fontSize: 16, 
                color: Colors.textSecondary,
                marginTop: 4 
              }}>
                Mohamed Hamed
              </Text>
            </Animated.View>
          </Animated.View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
