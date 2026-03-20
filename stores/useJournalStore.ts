import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/utils/storage";
import { JournalEntry } from "@/types";
import { generateId } from "@/utils/dateHelpers";

interface JournalState {
  entries: JournalEntry[];
  addOrUpdateEntry: (
    date: string,
    data: Omit<JournalEntry, "id" | "date" | "createdAt">,
  ) => void;
  getEntryByDate: (date: string) => JournalEntry | undefined;
  getJournalStreak: () => number;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      addOrUpdateEntry: (date, data) =>
        set((s) => {
          const exists = s.entries.find((e) => e.date === date);
          if (exists)
            return {
              entries: s.entries.map((e) =>
                e.date === date ? { ...e, ...data } : e,
              ),
            };
          return {
            entries: [
              ...s.entries,
              {
                ...data,
                id: generateId(),
                date,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),
      getEntryByDate: (date) => get().entries.find((e) => e.date === date),
      getJournalStreak: () => {
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          if (
            get().entries.find((e) => e.date === d.toISOString().split("T")[0])
          )
            streak++;
          else break;
        }
        return streak;
      },
    }),
    { name: "journal-store", storage: createJSONStorage(() => storage) },
  ),
);
