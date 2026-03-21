import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Project } from "@/types";
import { Colors } from "@/constants/colors";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { PROJECT_CATEGORIES } from "@/constants/categories";
import { useProjectStore } from "@/stores/useProjectStore";

const STATUS_COLORS = {
  idea: Colors.warning,
  active: Colors.primary,
  completed: Colors.success,
};
const STATUS_LABELS = { idea: "فكرة", active: "شغال", completed: "مكتمل" };

export function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newStep, setNewStep] = useState("");
  const {
    toggleStep,
    addStep,
    startStepTimer,
    stopStepTimer,
    completeProject,
    updateProject,
  } = useProjectStore();

  const cat = PROJECT_CATEGORIES.find((c) => c.key === project.category);
  const doneSteps = project.steps.filter((s) => s.completed).length;
  const totalSteps = project.steps.length;
  const percent = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0;
  const totalHours = Math.floor(project.totalTimeMinutes / 60);
  const totalMins = project.totalTimeMinutes % 60;

  const handleAddStep = () => {
    if (!newStep.trim()) return;
    addStep(project.id, newStep.trim());
    setNewStep("");
  };

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor:
          project.status === "completed" ? Colors.successLight : Colors.border,
        borderTopWidth: 3,
        borderTopColor: STATUS_COLORS[project.status],
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
          {cat?.emoji ?? "📦"}
        </Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Cairo-Bold",
              fontSize: 16,
              color: Colors.textPrimary,
            }}
          >
            {project.title}
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
              label={STATUS_LABELS[project.status]}
              color={STATUS_COLORS[project.status]}
              bgColor={STATUS_COLORS[project.status] + "20"}
            />
            <Badge
              label={cat?.label ?? ""}
              color={Colors.primaryMid}
              bgColor={Colors.primaryPale}
            />
            {project.totalTimeMinutes > 0 && (
              <Badge
                label={`⏱ ${totalHours}س ${totalMins}د`}
                color={Colors.textSecondary}
                bgColor={Colors.primaryLight}
              />
            )}
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {onDelete ? (
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={10}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: Colors.dangerLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="trash-outline" size={17} color={Colors.danger} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            hitSlop={10}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: Colors.primaryXPale,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {totalSteps > 0 && (
        <View style={{ marginBottom: 10 }}>
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
              {doneSteps}/{totalSteps} خطوات
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
          <ProgressBar percent={percent} height={7} />
        </View>
      )}

      {expanded && (
        <View style={{ marginTop: 8 }}>
          {project.steps.map((step) => (
            <View
              key={step.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: Colors.borderLight,
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleStep(project.id, step.id);
                }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 1.5,
                  borderColor: step.completed ? Colors.success : Colors.border,
                  backgroundColor: step.completed
                    ? Colors.success
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {step.completed && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  fontFamily: "Cairo-Regular",
                  fontSize: 14,
                  color: step.completed ? Colors.textMuted : Colors.textPrimary,
                  textDecorationLine: step.completed ? "line-through" : "none",
                }}
              >
                {step.title}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  step.timerStartedAt
                    ? stopStepTimer(project.id, step.id)
                    : startStepTimer(project.id, step.id)
                }
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: step.timerStartedAt
                    ? Colors.warningLight
                    : Colors.primaryLight,
                }}
              >
                <Text style={{ fontSize: 12 }}>
                  {step.timerStartedAt ? "⏸" : "▶️"}
                </Text>
              </TouchableOpacity>
              {step.timeSpentMinutes > 0 && (
                <Text
                  style={{
                    fontFamily: "Cairo-Regular",
                    fontSize: 11,
                    color: Colors.textMuted,
                  }}
                >
                  {step.timeSpentMinutes}د
                </Text>
              )}
            </View>
          ))}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <TextInput
              value={newStep}
              onChangeText={setNewStep}
              placeholder="أضف خطوة..."
              placeholderTextColor={Colors.textMuted}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 12,
                fontFamily: "Cairo-Regular",
                fontSize: 14,
                color: Colors.textPrimary,
              }}
              textAlign="right"
              onSubmitEditing={handleAddStep}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddStep}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: Colors.primaryLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {project.status !== "completed" && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              {project.status === "idea" && (
                <TouchableOpacity
                  onPress={() =>
                    updateProject(project.id, {
                      status: "active",
                      startedAt: new Date().toISOString(),
                    })
                  }
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: Colors.primaryLight,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Cairo-SemiBold",
                      fontSize: 13,
                      color: Colors.primary,
                    }}
                  >
                    🚀 ابدأ المشروع
                  </Text>
                </TouchableOpacity>
              )}
              {project.status === "active" &&
                doneSteps === totalSteps &&
                totalSteps > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      void Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                      completeProject(project.id);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: Colors.successLight,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Cairo-SemiBold",
                        fontSize: 13,
                        color: Colors.success,
                      }}
                    >
                      🎉 أكمل المشروع
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          )}

          {project.status === "completed" && project.achievement && (
            <View
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 14,
                backgroundColor: Colors.successLight,
                borderWidth: 1,
                borderColor: Colors.success + "40",
              }}
            >
              <Text
                style={{
                  fontFamily: "Cairo-Bold",
                  fontSize: 14,
                  color: Colors.success,
                  marginBottom: 6,
                }}
              >
                🏆 إنجاز مكتمل!
              </Text>
              <Text
                style={{
                  fontFamily: "Cairo-Regular",
                  fontSize: 13,
                  color: Colors.textSecondary,
                }}
              >
                ✅ {project.achievement.stepsCompleted} خطوة{`\n`}
                📅 {project.achievement.daysSpent} يوم{`\n`}⏱{" "}
                {Math.floor(project.achievement.totalMinutes / 60)}س{" "}
                {project.achievement.totalMinutes % 60}د
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
