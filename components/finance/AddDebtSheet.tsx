import { useState } from "react";
import { Alert, View, Text, TextInput, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import * as Contacts from "expo-contacts";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { getTodayString } from "@/utils/dateHelpers";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { inputLabel, inputStyle } from "@/constants/styles";

export function AddDebtSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [contactId, setContactId] = useState<string | undefined>(undefined);
  const [contactNameSnapshot, setContactNameSnapshot] = useState<string | undefined>(undefined);
  const [contactSuggestions, setContactSuggestions] = useState<Contacts.Contact[]>([]);
  const { addDebt } = useFinanceStore();

  const handlePickContact = async () => {
    const permission = await Contacts.requestPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("جهات الاتصال", "لا يمكن اختيار جهة اتصال بدون صلاحية.");
      return;
    }

    const list = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name],
      pageSize: 30,
    });

    if (!list.data.length) {
      Alert.alert("جهات الاتصال", "لا توجد جهات اتصال متاحة.");
      return;
    }
    setContactSuggestions(list.data.filter((item) => !!item.name).slice(0, 12));
  };

  const handleSave = () => {
    if (!personName.trim() || !amount) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addDebt({
      direction,
      personName: personName.trim(),
      contactId,
      contactNameSnapshot: contactNameSnapshot ?? personName.trim(),
      totalAmount: Number.parseFloat(amount),
      date: getTodayString(),
      note,
    });
    setPersonName("");
    setAmount("");
    setNote("");
    setContactId(undefined);
    setContactNameSnapshot(undefined);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="دين جديد" snapPoints={["72%", "95%"]}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 4 }}>
          {(
            [
              ["owed_to_me", "💚 ليك عند حد"],
              ["i_owe", "❤️ عليك لحد"],
            ] as const
          ).map(([key, lbl]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setDirection(key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: direction === key ? Colors.surface : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Cairo-SemiBold",
                  fontSize: 13,
                  color: direction === key ? Colors.primary : Colors.textSecondary,
                }}
              >
                {lbl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text style={inputLabel}>الاسم أو جهة الاتصال *</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={personName}
              onChangeText={setPersonName}
              placeholder="مثلاً: أحمد"
              placeholderTextColor={Colors.textMuted}
              style={[inputStyle, { textAlign: "right", flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => {
                void handlePickContact();
              }}
              style={{
                width: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.surface,
              }}
            >
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>
          {contactNameSnapshot ? (
            <Text style={{ fontFamily: "Cairo-Regular", fontSize: 12, color: Colors.primary, marginTop: 6 }}>
              مرتبط بجهة الاتصال: {contactNameSnapshot}
            </Text>
          ) : null}
          {contactSuggestions.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {contactSuggestions.map((contact) => (
                (() => {
                  const contactIdValue = (contact as any).id as string | undefined;
                  return (
                <TouchableOpacity
                  key={contactIdValue || contact.name}
                  onPress={() => {
                    if (!contact.name) return;
                    setContactId(contactIdValue);
                    setContactNameSnapshot(contact.name);
                    setPersonName(contact.name);
                    setContactSuggestions([]);
                  }}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    backgroundColor: Colors.surface,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontFamily: "Cairo-SemiBold", fontSize: 12, color: Colors.textPrimary }}>
                    {contact.name}
                  </Text>
                </TouchableOpacity>
                  );
                })()
              ))}
            </View>
          )}
        </View>

        <View>
          <Text style={inputLabel}>المبلغ *</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
            style={[inputStyle, { textAlign: "right" }]}
          />
        </View>

        <View>
          <Text style={inputLabel}>ملاحظة</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="سبب الدين..."
            placeholderTextColor={Colors.textMuted}
            style={[inputStyle, { height: 80, textAlignVertical: "top", paddingTop: 12, textAlign: "right" }]}
            multiline
          />
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <PrimaryButton label="إلغاء" variant="outline" onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton
            label="💾 حفظ الدين"
            onPress={handleSave}
            disabled={!personName || !amount}
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: 20 }} />
      </View>
    </BottomSheet>
  );
}
