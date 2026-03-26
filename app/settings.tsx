import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";
import { Colors } from "@/constants/colors";
import { GradientHeader } from "@/components/ui/GradientHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppStore } from "@/stores/useAppStore";
import { exportBackup, importBackup } from "@/utils/backup";
import {
  configureNotifications,
  getNotificationPermission,
  hasGrantedNotificationPermission,
} from "@/utils/notifications";
import { Linking } from "react-native";

export default function SettingsScreen() {
  const { settings, updateSettings } = useAppStore();
  const [name, setName] = useState(settings.userName);
  const [backingUp, setBackingUp] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const syncPermission = async () => {
      const permission = await getNotificationPermission();
      const granted = hasGrantedNotificationPermission(permission);
      if (settings.notificationsEnabled !== granted) {
        updateSettings({ notificationsEnabled: granted });
      }
    };
    void syncPermission();
  }, [settings.notificationsEnabled, updateSettings]);

  const handleSaveName = () => {
    if (!name.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({ userName: name.trim() });
    Alert.alert("تم", "تم حفظ الاسم بنجاح");
  };

  const handleBackup = async () => {
    setBackingUp(true);
    const ok = await exportBackup();
    setBackingUp(false);
    if (!ok) Alert.alert("خطأ", "فشل في تصدير البيانات");
  };

  const handleImportBackup = async () => {
    const firstConfirm = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "تحذير",
        "الاستيراد سيستبدل كل بياناتك الحالية بالكامل.",
        [
          { text: "إلغاء", style: "cancel", onPress: () => resolve(false) },
          { text: "متابعة", style: "destructive", onPress: () => resolve(true) },
        ],
      );
    });
    if (!firstConfirm) return;

    const secondConfirm = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "تأكيد نهائي",
        "هل أنت متأكد من الاستبدال الكامل؟",
        [
          { text: "رجوع", style: "cancel", onPress: () => resolve(false) },
          { text: "استيراد الآن", style: "destructive", onPress: () => resolve(true) },
        ],
      );
    });
    if (!secondConfirm) return;

    setImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        setImporting(false);
        return;
      }
      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const content = await response.text();
      const ok = await importBackup(content);
      if (!ok) {
        Alert.alert("خطأ", "ملف النسخة الاحتياطية غير صالح.");
        setImporting(false);
        return;
      }
      Alert.alert("تم", "تم استيراد النسخة بنجاح. سيتم إعادة تحميل التطبيق.");
      setTimeout(() => {
        void Updates.reloadAsync();
      }, 700);
    } catch {
      Alert.alert("خطأ", "حدث خطأ أثناء الاستيراد.");
    } finally {
      setImporting(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    const ok = await configureNotifications(true);
    if (!ok) {
      Alert.alert(
        "الإشعارات",
        "لازم تسمح بالإشعارات من إعدادات الجهاز.",
        [
          { text: "لاحقًا", style: "cancel" },
          { text: "افتح الإعدادات", onPress: () => void Linking.openSettings() },
        ],
      );
      updateSettings({ notificationsEnabled: false });
      return;
    }
    updateSettings({ notificationsEnabled: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <GradientHeader
        title="الإعدادات ⚙️"
        leftAction={{ icon: "arrow-forward", onPress: () => router.back() }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}>
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
            <TouchableOpacity onPress={handleSaveName} style={saveBtn}>
              <Text style={{ fontFamily: "Cairo-SemiBold", color: "#fff" }}>حفظ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>👁️ العرض</Text>
          <SettingRow
            label="إخفاء الرصيد"
            value={settings.balanceHidden}
            onValueChange={(v) => updateSettings({ balanceHidden: v })}
          />
        </View>

        <View style={card}>
          <Text style={sectionTitle}>🔔 الإشعارات</Text>
          <SettingRow
            label="تفعيل الإشعارات"
            value={settings.notificationsEnabled}
            onValueChange={(v) => {
              void handleToggleNotifications(v);
            }}
          />
          <Text style={hint}>تذكيرات ذكية يومية + المهام والعادات.</Text>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>🔐 الحماية</Text>
          <SettingRow
            label="قفل التطبيق"
            value={settings.appLockEnabled}
            onValueChange={(v) => updateSettings({ appLockEnabled: v })}
          />
          <SettingRow
            label="فتح بالبيومتريك"
            value={settings.biometricEnabled}
            onValueChange={(v) => updateSettings({ biometricEnabled: v })}
          />
          <Text style={hint}>يعمل القفل عند فتح التطبيق أو الرجوع من الخلفية.</Text>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>💾 التوفير الذكي</Text>
          <SettingRow
            label="توفير تلقائي من الراتب"
            value={settings.autoSaveSalaryEnabled}
            onValueChange={(v) => updateSettings({ autoSaveSalaryEnabled: v })}
          />
          <Text style={lbl}>نسبة التحويش الافتراضية</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[10, 15, 20].map((rate) => (
              <TouchableOpacity
                key={rate}
                onPress={() => updateSettings({ autoSaveSalaryRate: rate })}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: settings.autoSaveSalaryRate === rate ? Colors.primary : Colors.border,
                  backgroundColor:
                    settings.autoSaveSalaryRate === rate ? Colors.primaryPale : Colors.surface,
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Cairo-Bold",
                    fontSize: 14,
                    color: settings.autoSaveSalaryRate === rate ? Colors.primary : Colors.textSecondary,
                  }}
                >
                  {rate}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={card}>
          <Text style={sectionTitle}>💽 النسخ الاحتياطي</Text>
          <Text style={{ fontFamily: "Cairo-Regular", fontSize: 13, color: Colors.textSecondary, marginBottom: 12, lineHeight: 20 }}>
            تصدير واستيراد كامل لبياناتك بصيغة JSON.
          </Text>
          <PrimaryButton
            label={backingUp ? "⏳ جاري التصدير..." : "📤 تصدير النسخة الاحتياطية"}
            onPress={handleBackup}
            loading={backingUp}
            variant="outline"
          />
          <View style={{ height: 8 }} />
          <PrimaryButton
            label={importing ? "⏳ جاري الاستيراد..." : "📥 استيراد نسخة احتياطية"}
            onPress={() => {
              void handleImportBackup();
            }}
            loading={importing}
          />
        </View>

        <View style={[card, { alignItems: "center", gap: 6 }]}>
          <Text style={{ fontFamily: "Cairo-Bold", fontSize: 16, color: Colors.textPrimary }}>Mizan</Text>
          <Text style={{ fontFamily: "Cairo-Regular", fontSize: 12, color: Colors.textMuted }}>
            الإصدار 1.1.2
          </Text>
          <Text style={{ fontFamily: "Cairo-Regular", fontSize: 12, color: Colors.textMuted }}>
            بياناتك محفوظة على جهازك فقط 🔒
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontFamily: "Cairo-Regular", fontSize: 14, color: Colors.textPrimary }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.borderLight, true: Colors.primary }}
        thumbColor="#fff"
      />
    </View>
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
const hint: any = {
  fontFamily: "Cairo-Regular",
  fontSize: 12,
  color: Colors.textMuted,
  marginTop: 6,
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
const saveBtn: any = {
  paddingHorizontal: 16,
  height: 48,
  borderRadius: 12,
  backgroundColor: Colors.primary,
  alignItems: "center",
  justifyContent: "center",
};
