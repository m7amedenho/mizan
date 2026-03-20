import { Tabs } from 'expo-router'
import { View, Text, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useRef } from 'react'

const TABS = [
  { name: 'index',    icon: 'home-outline',             activeIcon: 'home',             label: 'الرئيسية' },
  { name: 'tasks',    icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', label: 'مهامي'    },
  { name: 'finance',  icon: 'wallet-outline',           activeIcon: 'wallet',           label: 'فلوسي'    },
  { name: 'projects', icon: 'rocket-outline',           activeIcon: 'rocket',           label: 'مشاريع'   },
  { name: 'stats',    icon: 'bar-chart-outline',        activeIcon: 'bar-chart',        label: 'إحصائيات' },
]

function TabIcon({ icon, activeIcon, label, focused }: {
  icon: string; activeIcon: string; label: string; focused: boolean
}) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.06 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start()
  }, [focused])

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6, 
      paddingHorizontal: 10,
      borderRadius: 16,
      backgroundColor: focused ? '#F0FAF3' : 'transparent',
      transform: [{ scale }],
      minWidth: 58,
    }}>

      <Ionicons
        name={(focused ? activeIcon : icon) as any}
        size={22}
        color={focused ? '#1A4731' : '#94A3A0'}
      />

      <Text style={{
        fontFamily: 'Cairo-Bold',
        fontSize: 10,
        color: focused ? '#1A4731' : '#94A3A0',
        marginTop: 3,
        includeFontPadding: false,
      }} numberOfLines={1}>
        {label}
      </Text>

      <View style={{
        width: focused ? 16 : 0,
        height: 3,
        borderRadius: 2,
        marginTop: 3,
        backgroundColor: '#1A4731',
      }} />

    </Animated.View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const NAV_HEIGHT = 64 + insets.bottom

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      lazy: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        paddingBottom: insets.bottom, // بيحافظ على المساحة السفلية للآيفون (Home Indicator)
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8F0EA',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#1A4731',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 12,
      },
      tabBarItemStyle: {
        // شيلنا الـ height من هنا وسيبناه ياخد المساحة الطبيعية
        paddingTop: 0, // بيلغي المسافات الافتراضية
        paddingBottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      tabBarIconStyle: {
        // ده السطر السحري اللي بيخلي الكونتينر بتاع الأيقونة يتفرد في النص بالظبط
        flex: 1, 
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }
    }}>
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon {...tab} focused={focused} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="goals" options={{ href: null }} />
    </Tabs>
  )
}