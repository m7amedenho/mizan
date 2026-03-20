import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { Task, SubTask } from '@/types'
import { generateId, getTodayString } from '@/utils/dateHelpers'
import { cancelNotification } from '@/utils/notifications'

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string
  updateTask: (id: string, partial: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  toggleSubTask: (taskId: string, subTaskId: string) => void
  getTodayTasks: () => Task[]
  generateRecurring: () => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) => {
        const id = generateId()
        set((s) => ({ tasks: [...s.tasks, { ...task, id, createdAt: new Date().toISOString() }] }))
        return id
      },
      updateTask: (id, partial) =>
        set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...partial } : t) })),
      deleteTask: (id) => {
        const existing = get().tasks.find((t) => t.id === id)
        if (existing?.notificationId) {
          void cancelNotification(existing.notificationId)
        }
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
      },
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? (() => {
                  const nextCompleted = !t.completed
                  if (nextCompleted && t.notificationId) {
                    void cancelNotification(t.notificationId)
                  }
                  return {
                    ...t,
                    completed: nextCompleted,
                    completedAt: nextCompleted ? new Date().toISOString() : undefined,
                    notificationId: nextCompleted ? undefined : t.notificationId,
                  }
                })()
              : t,
          ),
        })),
      toggleSubTask: (taskId, subTaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t
            const updated = t.subTasks.map((st) =>
              st.id === subTaskId ? { ...st, completed: !st.completed } : st,
            )
            return { ...t, subTasks: updated, completed: updated.every((st) => st.completed) }
          }),
        })),
      getTodayTasks: () => {
        const today = getTodayString()
        return get().tasks.filter((t) => t.dueDate.startsWith(today))
      },
      generateRecurring: () => {
        const today = getTodayString()
        const { tasks, addTask } = get()
        tasks.filter((t) => t.recurrence !== 'none' && t.completed).forEach((t) => {
          const exists = tasks.some((x) => x.dueDate.startsWith(today) && x.title === t.title && !x.completed)
          if (!exists) {
            addTask({ ...t, completed: false, completedAt: undefined, dueDate: today, subTasks: t.subTasks.map((st) => ({ ...st, completed: false })) })
          }
        })
      },
    }),
    { name: 'task-store', storage: createJSONStorage(() => storage) },
  ),
)
