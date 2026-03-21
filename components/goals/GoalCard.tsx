import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Goal } from "@/types";
import { Colors } from "@/constants/colors";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { GOAL_CATEGORIES } from "@/constants/categories";
import { useGoalStore } from "@/stores/useGoalStore";
import { diffDaysBetweenDateKeys, getTodayString } from "@/utils/dateHelpers";

export function GoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false);
  const { toggleSubGoal } = useGoalStore();
  const cat = GOAL_CATEGORIES.find((c) => c.key === goal.category);
  const done = goal.subGoals.filter((s) => s.completed).length;
  const total = goal.subGoals.length;
  const percent = total > 0 ? (done / total) * 100 : 0;

  const daysLeft = diffDaysBetweenDateKeys(getTodayString(), goal.targetDate);

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: goal.completed ? Colors.successLight : Colors.border,
        opacity: goal.completed ? 0.8 : 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 28, marginLeft: 10 }}>
          {cat?.emoji ?? "🎯"}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Cairo-Bold",
              fontSize: 15,
              color: Colors.textPrimary,
            }}
          >
            {goal.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            <Badge
              label={cat?.label ?? ""}
              color={Colors.primaryMid}
              bgColor={Colors.primaryPale}
            />
            {!goal.completed && daysLeft > 0 && (
              <Badge
                label={`متبقي ${daysLeft} يوم`}
                color={daysLeft < 7 ? Colors.danger : Colors.textSecondary}
                bgColor={
                  daysLeft < 7 ? Colors.dangerLight : Colors.primaryLight
                }
              />
            )}
            {goal.completed && (
              <Badge
                label="✅ محقق!"
                color={Colors.success}
                bgColor={Colors.successLight}
              />
            )}
          </View>
        </View>
        {total > 0 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {total > 0 && (
        <View style={{ marginBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "Cairo-Regular",
                fontSize: 12,
                color: Colors.textSecondary,
              }}
            >
              {done}/{total} خطوات
            </Text>
            <Text
              style={{
                fontFamily: "Cairo-SemiBold",
                fontSize: 12,
                color: Colors.primary,
              }}
            >
              {Math.round(percent)}٪
            </Text>
          </View>
          <ProgressBar percent={percent} height={6} />
        </View>
      )}

      {expanded && (
        <View style={{ marginTop: 8, gap: 8 }}>
          {goal.subGoals.map((sg) => (
            <TouchableOpacity
              key={sg.id}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleSubGoal(goal.id, sg.id);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: sg.completed ? Colors.success : Colors.border,
                  backgroundColor: sg.completed
                    ? Colors.success
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {sg.completed && (
                  <Ionicons name="checkmark" size={11} color="#fff" />
                )}
              </View>
              <Text
                style={{
                  fontFamily: "Cairo-Regular",
                  fontSize: 13,
                  color: sg.completed ? Colors.textMuted : Colors.textPrimary,
                  flex: 1,
                  textDecorationLine: sg.completed ? "line-through" : "none",
                }}
              >
                {sg.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
