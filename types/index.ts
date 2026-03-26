export interface AppSettings {
  userName: string
  isOnboarded: boolean
  pomodoroFocus: number
  pomodoroShortBreak: number
  pomodoroLongBreak: number
  balanceHidden: boolean
  notificationsEnabled: boolean
  appLockEnabled: boolean
  biometricEnabled: boolean
  autoSaveSalaryEnabled: boolean
  autoSaveSalaryRate: number
}

export type Priority = 'high' | 'medium' | 'low'
export type TaskCategory = 'work' | 'personal' | 'learning' | 'health' | 'other'
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly'

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  dueTime?: string
  priority: Priority
  category: TaskCategory
  completed: boolean
  completedAt?: string
  subTasks: SubTask[]
  recurrence: Recurrence
  notificationId?: string
  projectId?: string
  createdAt: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  frequency: 'daily' | 'specific_days'
  days?: number[]
  targetPerDay?: number
  reminderTime?: string
  reminderTimes?: string[]
  notificationId?: string
  notificationIds?: string[]
  completions: string[]
  createdAt: string
}

export type WalletType = 'cash' | 'bank' | 'ewallet'
export type TransactionFlow = 'regular' | 'debt_new' | 'debt_payment' | 'transfer'
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'education'
  | 'health'
  | 'other'
export type IncomeCategory = 'salary' | 'freelance' | 'gift' | 'investment' | 'other'

export interface Wallet {
  id: string
  name: string
  type: WalletType
  balance: number
  reservedBalance: number
  createdAt: string
}

export interface Transaction {
  id: string
  type: 'expense' | 'income'
  flow: TransactionFlow
  amount: number
  category: ExpenseCategory | IncomeCategory
  name: string
  walletId: string
  toWalletId?: string
  walletImpactMode?: 'affect_wallet' | 'record_only'
  autoSavedAmount?: number
  date: string
  note?: string
  debtId?: string
  personName?: string
  location?: { latitude: number; longitude: number; placeName: string }
  createdAt: string
}

export interface Payment {
  id: string
  amount: number
  date: string
  transactionId?: string
}

export interface Debt {
  id: string
  direction: 'owed_to_me' | 'i_owe'
  personName: string
  contactId?: string
  contactNameSnapshot?: string
  totalAmount: number
  payments: Payment[]
  date: string
  reminderDate?: string
  notificationId?: string
  note?: string
  settled: boolean
  createdAt: string
}

export interface Budget {
  category: ExpenseCategory
  monthlyLimit: number
  month: string
}

export type ProjectStatus = 'idea' | 'active' | 'completed'
export type ProjectCategory = 'app' | 'design' | 'learning' | 'business' | 'personal' | 'content' | 'other'

export interface ProjectStep {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  timeSpentMinutes: number
  timerStartedAt?: string
}

export interface Project {
  id: string
  title: string
  description?: string
  category: ProjectCategory
  status: ProjectStatus
  goalId?: string
  steps: ProjectStep[]
  totalTimeMinutes: number
  startedAt?: string
  completedAt?: string
  achievement?: {
    badgeType: ProjectCategory
    daysSpent: number
    stepsCompleted: number
    totalMinutes: number
  }
  createdAt: string
}

export type GoalCategory = 'career' | 'personal' | 'health' | 'financial' | 'learning'

export interface SubGoal {
  id: string
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  category: GoalCategory
  description?: string
  targetDate: string
  subGoals: SubGoal[]
  linkedProjectIds: string[]
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface Challenge {
  id: string
  title: string
  description?: string
  durationDays: number
  startDate: string
  type: 'daily' | 'weekly'
  checkIns: string[]
  completed: boolean
  completedAt?: string
  notificationId?: string
  createdAt: string
}

export interface JournalEntry {
  id: string
  date: string
  bestThing: string
  learned: string
  tomorrowGoal: string
  createdAt: string
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface MoodEntry {
  id: string
  date: string
  mood: MoodLevel
  note?: string
  createdAt: string
}

export type BadgeType =
  | 'first_task'
  | 'streak_7'
  | 'streak_21'
  | 'first_project'
  | 'project_5'
  | 'saver_1000'
  | 'habit_master'
  | 'challenge_done'
  | 'challenge_3'
  | 'productive_100'

export interface Badge {
  type: BadgeType
  unlockedAt: string
}

export interface Note {
  id: string
  title: string
  body: string
  location?: { latitude: number; longitude: number; placeName: string }
  updatedAt: string
  createdAt: string
}
