import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { GradientHeader } from "@/components/ui/GradientHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppStore } from "@/stores/useAppStore";
import { exportBackup } from "@/utils/backup";
import { BADGES_CONFIG } from "@/constants/badges";
import { configureNotifications } from "@/utils/notifications";
import { Linking } from "react-native";
export default function SettingsScreen() {
  const { settings, updateSettings, badges } = useAppStore();
  const [name, setName] = useState(settings.userName);
  const [backingUp, setBackingUp] = useState(false);

  const handleSaveName = () => {
    if (!name.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({ userName: name.trim() });
    Alert.alert("✅ تم", "تم حفظ الاسم بنجاح");
  };

  const handleBackup = async () => {
    setBackingUp(true);
    const ok = await exportBackup();
    setBackingUp(false);
    if (!ok) Alert.alert("خطأ", "فشل في تصدير البيانات");
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    const ok = await configureNotifications();
    if (!ok) {
      Alert.alert("الإشعارات", "لازم تسمح بالإشعارات من إعدادات الجهاز.");
      updateSettings({ notificationsEnabled: false });
      return;
    }
    updateSettings({ notificationsEnabled: true });
  };
  const SOCIAL_LINKS = [
    {
      icon: "logo-github",
      label: "GitHub",
      url: "https://github.com/m7amedenho",
      color: "#1a1a1a",
      bg: "#f5f5f5",
    },
    {
      icon: "logo-linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/m7amedenho/",
      color: "#0A66C2",
      bg: "#EBF3FB",
    },
    {
      icon: "logo-instagram",
      label: "Instagram",
      url: "https://www.instagram.com/m.7amedenho",
      color: "#E1306C",
      bg: "#FDE8F0",
    },
  ];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["bottom"]}
    >
      <GradientHeader
        title="الإعدادات ⚙️"
        leftAction={{ icon: "arrow-back", onPress: () => router.back() }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}
      >
        <View style={card}>
          <Text style={sectionTitle}>👤 معلوماتي</Text>
          <Text style={lbl}>اسمك</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[inp, { flex: 1 }]}
              textAlign="right"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              onPress={handleSaveName}
              style={{
                paddingHorizontal: 16,
                height: 48,
                borderRadius: 12,
                backgroundColor: Colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Cairo-SemiBold", color: "#fff" }}>
                حفظ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>👁️ العرض</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Cairo-Regular",
                fontSize: 14,
                color: Colors.textPrimary,
              }}
            >
              إخفاء الرصيد
            </Text>
            <Switch
              value={settings.balanceHidden}
              onValueChange={(v) => updateSettings({ balanceHidden: v })}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>🔔 الإشعارات</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Cairo-Regular",
                fontSize: 14,
                color: Colors.textPrimary,
              }}
            >
              تفعيل إشعارات المهام والعادات
            </Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(v) => {
                void handleToggleNotifications(v);
              }}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <Text
            style={{
              fontFamily: "Cairo-Regular",
              fontSize: 12,
              color: Colors.textMuted,
              marginTop: 4,
            }}
          >
            تذكير المهمة يعتمد على تاريخ + وقت المهمة، والعادة تعتمد على وقت
            التذكير.
          </Text>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>⏱ إعدادات البومودورو</Text>
          {[
            {
              label: "وقت التركيز (دقيقة)",
              key: "pomodoroFocus" as const,
              value: settings.pomodoroFocus,
            },
            {
              label: "استراحة قصيرة",
              key: "pomodoroShortBreak" as const,
              value: settings.pomodoroShortBreak,
            },
            {
              label: "استراحة طويلة",
              key: "pomodoroLongBreak" as const,
              value: settings.pomodoroLongBreak,
            },
          ].map((item) => (
            <View
              key={item.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Cairo-Regular",
                  fontSize: 14,
                  color: Colors.textPrimary,
                }}
              >
                {item.label}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <TouchableOpacity
                  onPress={() =>
                    updateSettings({ [item.key]: Math.max(1, item.value - 5) })
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Colors.primaryLight,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="remove" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontFamily: "Cairo-Bold",
                    fontSize: 16,
                    color: Colors.textPrimary,
                    minWidth: 30,
                    textAlign: "center",
                  }}
                >
                  {item.value}
                </Text>
                <TouchableOpacity
                  onPress={() => updateSettings({ [item.key]: item.value + 5 })}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Colors.primaryLight,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {badges.length > 0 && (
          <View style={card}>
            <Text style={sectionTitle}>🏆 إنجازاتي</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {badges.map((b) => {
                const config = BADGES_CONFIG[b.type];
                return (
                  <View
                    key={b.type}
                    style={{ alignItems: "center", gap: 4, width: 70 }}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: Colors.primaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: Colors.primary,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{config.emoji}</Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Cairo-Regular",
                        fontSize: 10,
                        color: Colors.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      {config.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={card}>
          <Text style={sectionTitle}>💾 النسخ الاحتياطي</Text>
          <Text
            style={{
              fontFamily: "Cairo-Regular",
              fontSize: 13,
              color: Colors.textSecondary,
              marginBottom: 12,
              lineHeight: 20,
            }}
          >
            صدّر كل بياناتك كملف JSON على جهازك. مفيش أي بيانات بتتبعت لأي
            سيرفر.
          </Text>
          <PrimaryButton
            label={
              backingUp ? "⏳ جاري التصدير..." : "📤 تصدير النسخة الاحتياطية"
            }
            onPress={handleBackup}
            loading={backingUp}
            variant="outline"
          />
        </View>

        <View style={[card, { alignItems: "center", gap: 6 }]}>
          <Image
            source={require("@/assets/splash-icon.png")}
            style={{ width: 70, height: 70, borderRadius: 14 }}
          />
          {/* <Text
            style={{
              fontFamily: "Cairo-Bold",
              fontSize: 16,
              color: Colors.textPrimary,
            }}
          >
            ميزان
          </Text> */}
          <Text
            style={{
              fontFamily: "Cairo-Regular",
              fontSize: 12,
              color: Colors.textMuted,
            }}
          >
            الإصدار ١.٠.٠
          </Text>
          <Text
            style={{
              fontFamily: "Cairo-Regular",
              fontSize: 12,
              color: Colors.textMuted,
            }}
          >
            بياناتك محفوظة على جهازك فقط 🔒
          </Text>
        </View>

        {/* Developer section */}
        <View style={[card, { gap: 14 }]}>
          <Text
            style={{
              fontFamily: "Cairo-Bold",
              fontSize: 15,
              color: Colors.textPrimary,
            }}
          >
            👨‍💻 المطور
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Avatar initials */}
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: Colors.primaryPale,
                borderWidth: 1.5,
                borderColor: Colors.borderMedium,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Cairo-Bold",
                  fontSize: 16,
                  color: Colors.primary,
                }}
              >
                م
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Cairo-Bold",
                  fontSize: 14,
                  color: Colors.textPrimary,
                }}
              >
                Mohamed Hamid
              </Text>
              <Text
                style={{
                  fontFamily: "Cairo-Regular",
                  fontSize: 12,
                  color: Colors.textMuted,
                }}
              >
                م. محمد حامد · Full Stack Developer
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: Colors.borderLight }} />

          {/* Social buttons */}
          <View style={{ gap: 8 }}>
            {SOCIAL_LINKS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => Linking.openURL(item.url)}
                activeOpacity={0.75}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 11,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: item.bg,
                  borderWidth: 1,
                  borderColor: item.color + "22",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
                <Text
                  style={{
                    fontFamily: "Cairo-SemiBold",
                    fontSize: 14,
                    color: item.color,
                    flex: 1,
                  }}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={item.color + "80"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Made with love */}
        <View style={{ alignItems: "center", paddingVertical: 8, gap: 4 }}>
          <Text
            style={{
              fontFamily: "Cairo-Regular",
              fontSize: 11,
              color: Colors.textMuted,
            }}
          >
            مفتوح المصدر · GPL-3.0
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const card: any = {
  backgroundColor: Colors.surface,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: Colors.border,
};
const sectionTitle: any = {
  fontFamily: "Cairo-Bold",
  fontSize: 16,
  color: Colors.textPrimary,
  marginBottom: 14,
};
const lbl: any = {
  fontFamily: "Cairo-SemiBold",
  fontSize: 14,
  color: Colors.textSecondary,
  marginBottom: 8,
};
const inp: any = {
  backgroundColor: Colors.background,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 12,
  height: 48,
  paddingHorizontal: 14,
  fontFamily: "Cairo-Regular",
  fontSize: 15,
  color: Colors.textPrimary,
};
