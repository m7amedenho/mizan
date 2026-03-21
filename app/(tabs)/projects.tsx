import { useState } from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { GradientHeader } from "@/components/ui/GradientHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AddProjectSheet } from "@/components/projects/AddProjectSheet";
import { useProjectStore } from "@/stores/useProjectStore";

type Filter = "active" | "idea" | "completed";

export default function ProjectsScreen() {
  const [filter, setFilter] = useState<Filter>("active");
  const [showAdd, setShowAdd] = useState(false);
  const { projects, deleteProject } = useProjectStore();

  const filtered = projects.filter((p) => p.status === filter);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["bottom"]}
    >
      <GradientHeader
        title="مشاريعي 🚀"
        subtitle={`${projects.filter((p) => p.status === "active").length} مشروع نشط`}
        rightAction={{ icon: "add-outline", onPress: () => setShowAdd(true) }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          marginTop: -24,
          paddingTop: 10,
        }}
      >
        <View style={s.tabRow}>
          {(
            [
              ["active", "🔵 شغال"],
              ["idea", "💡 فكرة"],
              ["completed", "✅ مكتمل"],
            ] as const
          ).map(([key, lbl]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              style={[s.tab, filter === key && s.tabActive]}
            >
              <Text style={[s.tabText, filter === key && s.tabTextActive]}>
                {lbl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            emoji={filter === "active" ? "🚀" : filter === "idea" ? "💡" : "🏆"}
            title={
              filter === "active"
                ? "مفيش مشاريع نشطة!"
                : filter === "idea"
                  ? "مفيش أفكار!"
                  : "مفيش مشاريع مكتملة!"
            }
            subtitle="ابدأ مشروعك الأول دلوقتي"
            actionLabel="+ مشروع جديد"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((project, i) => (
              <AnimatedCard key={project.id} delay={Math.min(i * 70, 350)}>
                <ProjectCard
                  project={project}
                  onDelete={() => {
                    Alert.alert(
                      "حذف المشروع",
                      `هل تريد حذف "${project.title}"؟`,
                      [
                        { text: "إلغاء", style: "cancel" },
                        {
                          text: "حذف",
                          style: "destructive",
                          onPress: () => deleteProject(project.id),
                        },
                      ],
                    );
                  }}
                />
              </AnimatedCard>
            ))}
          </ScrollView>
        )}
      </View>

      <AddProjectSheet visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: Colors.primaryXPale,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabTextActive: { color: "#fff" },
});
