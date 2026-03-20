import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { Project, ProjectStatus } from '@/types'
import { generateId } from '@/utils/dateHelpers'

interface ProjectState {
  projects: Project[]
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'totalTimeMinutes'>) => string
  updateProject: (id: string, partial: Partial<Project>) => void
  deleteProject: (id: string) => void
  addStep: (projectId: string, title: string) => void
  toggleStep: (projectId: string, stepId: string) => void
  startStepTimer: (projectId: string, stepId: string) => void
  stopStepTimer: (projectId: string, stepId: string) => void
  completeProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (p) => {
        const id = generateId()
        set((s) => ({ projects: [...s.projects, { ...p, id, totalTimeMinutes: 0, createdAt: new Date().toISOString() }] }))
        return id
      },
      updateProject: (id, partial) => set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...partial } : p) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      addStep: (projectId, title) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, steps: [...p.steps, { id: generateId(), title, completed: false, timeSpentMinutes: 0 }] } : p,
        ),
      })),
      toggleStep: (projectId, stepId) => set((s) => ({
        projects: s.projects.map((p) => {
          if (p.id !== projectId) return p
          const steps = p.steps.map((st) => st.id === stepId ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date().toISOString() : undefined } : st)
          return { ...p, steps }
        }),
      })),
      startStepTimer: (projectId, stepId) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, steps: p.steps.map((st) => st.id === stepId ? { ...st, timerStartedAt: new Date().toISOString() } : st) } : p,
        ),
      })),
      stopStepTimer: (projectId, stepId) => set((s) => ({
        projects: s.projects.map((p) => {
          if (p.id !== projectId) return p
          const steps = p.steps.map((st) => {
            if (st.id !== stepId || !st.timerStartedAt) return st
            const elapsed = Math.floor((Date.now() - new Date(st.timerStartedAt).getTime()) / 60000)
            return { ...st, timeSpentMinutes: st.timeSpentMinutes + elapsed, timerStartedAt: undefined }
          })
          return { ...p, steps, totalTimeMinutes: steps.reduce((sum, st) => sum + st.timeSpentMinutes, 0) }
        }),
      })),
      completeProject: (id) => set((s) => ({
        projects: s.projects.map((p) => {
          if (p.id !== id) return p
          const daysSpent = p.startedAt ? Math.ceil((Date.now() - new Date(p.startedAt).getTime()) / 86400000) : 1
          return {
            ...p, status: 'completed' as ProjectStatus,
            completedAt: new Date().toISOString(),
            achievement: { badgeType: p.category, daysSpent, stepsCompleted: p.steps.filter((st) => st.completed).length, totalMinutes: p.totalTimeMinutes },
          }
        }),
      })),
    }),
    { name: 'project-store', storage: createJSONStorage(() => storage) },
  ),
)
