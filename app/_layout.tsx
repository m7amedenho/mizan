import { useEffect, useState } from "react";
import { I18nManager, View, Text, AppState, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import {
  useFonts,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Animated, { FadeOut, FadeIn } from "react-native-reanimated";
import { useTaskStore } from "@/stores/useTaskStore";
import { useAppStore } from "@/stores/useAppStore";
import { Colors } from "@/constants/colors";
import { authenticateBiometric } from "@/utils/biometric";
import { refreshSmartNotifications } from "@/utils/smartNotifications";
import React from "react";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);
void SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Cairo-Regular": Cairo_400Regular,
    "Cairo-SemiBold": Cairo_600SemiBold,
    "Cairo-Bold": Cairo_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [appLocked, setAppLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const generateRecurring = useTaskStore((s) => s.generateRecurring);
  const { settings } = useAppStore();

  const unlockIfNeeded = async () => {
    if (!settings.appLockEnabled || !settings.biometricEnabled) {
      setAppLocked(false);
      return;
    }
    setUnlocking(true);
    const ok = await authenticateBiometric();
    setUnlocking(false);
    setAppLocked(!ok);
  };

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
      const timer = setTimeout(() => {
        if (!settings.isOnboarded) router.replace("/onboarding");
        setShowSplash(false);
      }, 1800);

      generateRecurring();
      void refreshSmartNotifications();
      void unlockIfNeeded();

      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          void refreshSmartNotifications();
          void unlockIfNeeded();
        }
      });

      return () => {
        clearTimeout(timer);
        sub.remove();
      };
    }
  }, [fontsLoaded, settings.isOnboarded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            animationDuration: 220,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
          <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
        </Stack>

        {showSplash && (
          <Animated.View
            exiting={FadeOut.duration(800)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: Colors.background,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <Animated.Image
              entering={FadeIn.duration(800)}
              source={require("@/assets/splash-icon.png")}
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />
            <Animated.View entering={FadeIn.delay(400).duration(800)} style={{ position: "absolute", bottom: 60, alignItems: "center" }}>
              <Text style={{ fontFamily: "Cairo-Bold", fontSize: 24, color: Colors.primary }}>Mizan App</Text>
              <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 16, color: Colors.textSecondary, marginTop: 4 }}>
                Mohamed Hamed
              </Text>
            </Animated.View>
          </Animated.View>
        )}

        {appLocked && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(6,18,12,0.95)",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
              zIndex: 1000,
            }}
          >
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🔒</Text>
            <Text style={{ fontFamily: "Cairo-Bold", fontSize: 20, color: "#fff" }}>التطبيق مقفول</Text>
            <Text style={{ fontFamily: "Cairo-Regular", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6, textAlign: "center" }}>
              افتح بالبصمة أو بصمة الوجه للمتابعة
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!unlocking) void unlockIfNeeded();
              }}
              style={{
                marginTop: 20,
                backgroundColor: Colors.primary,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontFamily: "Cairo-Bold", color: "#fff" }}>
                {unlocking ? "جاري التحقق..." : "إعادة المحاولة"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

