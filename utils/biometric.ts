import * as LocalAuthentication from "expo-local-authentication";

export const canUseBiometric = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateBiometric = async (): Promise<boolean> => {
  const ok = await canUseBiometric();
  if (!ok) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "افتح التطبيق",
    fallbackLabel: "استخدم قفل الجهاز",
    cancelLabel: "إلغاء",
    disableDeviceFallback: false,
  });
  return result.success;
};

