import { format, isToday, isTomorrow } from 'date-fns'
import { ar } from 'date-fns/locale'

export const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36)

const pad = (value: number): string => value.toString().padStart(2, '0')

export const toLocalDateString = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const toLocalTimeString = (date: Date = new Date()): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`

export const toLocalMonthString = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

export const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate()

export const createLocalDate = (year: number, month: number, day: number): Date => {
  const safeDay = Math.min(day, getDaysInMonth(year, month))
  return new Date(year, month - 1, safeDay, 12, 0, 0, 0)
}

export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return createLocalDate(year, month, day)
}

export const coerceDateValue = (value: unknown, fallback: Date = new Date()): Date => {
  if (!value) return fallback
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateString(value) : new Date(value)
  }
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  return fallback
}

export const parseTimeString = (time: string, baseDate: Date = new Date()): Date => {
  const [hours, minutes] = time.split(':').map(Number)
  const next = new Date(baseDate)
  next.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0)
  return next
}

export const combineDateAndTime = (dateStr: string, time: string): Date | null => {
  if (!dateStr.trim() || !time.trim()) return null
  const date = parseDateString(dateStr)
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  date.setHours(hours, minutes, 0, 0)
  return date
}

export const addDaysLocal = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const addDaysToDateKey = (dateKey: string, days: number): string =>
  toLocalDateString(addDaysLocal(parseDateString(dateKey), days))

export const compareDateKeys = (left: string, right: string): number =>
  parseDateString(left).getTime() - parseDateString(right).getTime()

export const isDateKeyBetween = (dateKey: string, startKey: string, endKey: string): boolean =>
  compareDateKeys(dateKey, startKey) >= 0 && compareDateKeys(dateKey, endKey) <= 0

export const diffDaysBetweenDateKeys = (fromKey: string, toKey: string): number => {
  const from = parseDateString(fromKey).getTime()
  const to = parseDateString(toKey).getTime()
  return Math.round((to - from) / 86400000)
}

export const formatDateAr = (date: string | Date): string =>
  format(
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? parseDateString(date)
      : new Date(date),
    'EEEE، d MMMM yyyy',
    { locale: ar },
  )

export const formatTimeAr = (time: string): string => {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'م' : 'ص'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export const formatAmountAr = (amount: number): string =>
  amount.toLocaleString('ar-EG') + ' جنيه'

export const getTodayString = (): string =>
  toLocalDateString()

export const getCurrentMonth = (): string =>
  toLocalMonthString()

export const getDayLabel = (dateStr: string): string => {
  const date = parseDateString(dateStr)
  if (isToday(date)) return 'اليوم'
  if (isTomorrow(date)) return 'غداً'
  return format(date, 'EEEE', { locale: ar })
}

export const isOverdue = (dateStr: string): boolean =>
  compareDateKeys(dateStr, getTodayString()) < 0
