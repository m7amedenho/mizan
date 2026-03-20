import { Colors } from './colors'

export const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'أكل وشرب', emoji: '🍕', color: Colors.catFood },
  { key: 'transport', label: 'مواصلات', emoji: '🚗', color: Colors.catTransport },
  { key: 'shopping', label: 'تسوق', emoji: '🛍️', color: Colors.catShopping },
  { key: 'bills', label: 'فواتير', emoji: '📱', color: Colors.catBills },
  { key: 'entertainment', label: 'ترفيه', emoji: '🎮', color: Colors.catEntertain },
  { key: 'education', label: 'تعليم', emoji: '📚', color: Colors.catEducation },
  { key: 'health', label: 'صحة', emoji: '🏥', color: Colors.catHealth },
  { key: 'other', label: 'أخرى', emoji: '📦', color: Colors.catOther },
] as const

export const INCOME_CATEGORIES = [
  { key: 'salary', label: 'مرتب', emoji: '💼' },
  { key: 'freelance', label: 'فريلانس', emoji: '🎯' },
  { key: 'gift', label: 'هدية', emoji: '🎁' },
  { key: 'investment', label: 'استثمار', emoji: '📈' },
  { key: 'other', label: 'أخرى', emoji: '📦' },
] as const

export const TASK_CATEGORIES = [
  { key: 'work', label: 'عمل', emoji: '💼', color: '#6366F1' },
  { key: 'personal', label: 'شخصي', emoji: '🏠', color: '#38BDF8' },
  { key: 'learning', label: 'تعلم', emoji: '📚', color: '#F59E0B' },
  { key: 'health', label: 'صحة', emoji: '💪', color: '#22C55E' },
  { key: 'other', label: 'أخرى', emoji: '📋', color: '#94A3B8' },
] as const

export const PROJECT_CATEGORIES = [
  { key: 'app', label: 'تطبيق', emoji: '📱' },
  { key: 'design', label: 'تصميم', emoji: '🎨' },
  { key: 'learning', label: 'تعلم', emoji: '📚' },
  { key: 'business', label: 'أعمال', emoji: '💼' },
  { key: 'personal', label: 'شخصي', emoji: '🏠' },
  { key: 'content', label: 'محتوى', emoji: '✍️' },
  { key: 'other', label: 'أخرى', emoji: '📦' },
] as const

export const GOAL_CATEGORIES = [
  { key: 'career', label: 'مهني', emoji: '🚀' },
  { key: 'personal', label: 'شخصي', emoji: '🌱' },
  { key: 'health', label: 'صحة', emoji: '💪' },
  { key: 'financial', label: 'مالي', emoji: '💰' },
  { key: 'learning', label: 'تعلم', emoji: '📚' },
] as const

export const HABIT_EMOJIS = [
  '💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '✍️',
  '🎯', '🎨', '🎸', '🧹', '💊', '🌿', '🙏', '⚡',
  '📖', '🎤', '🏊', '🚴', '🧠', '💻', '🌅', '🌙',
  '🍎', '☕', '🎮', '🎬', '🤝', '💡', '🔥', '⭐',
] as const
