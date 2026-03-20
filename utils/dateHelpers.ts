import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ar } from 'date-fns/locale'

export const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36)

export const formatDateAr = (date: string | Date): string =>
  format(new Date(date), 'EEEE، d MMMM yyyy', { locale: ar })

export const formatTimeAr = (time: string): string => {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'م' : 'ص'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export const formatAmountAr = (amount: number): string =>
  amount.toLocaleString('ar-EG') + ' جنيه'

export const getTodayString = (): string =>
  new Date().toISOString().split('T')[0]

export const getCurrentMonth = (): string =>
  new Date().toISOString().slice(0, 7)

export const getDayLabel = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isToday(date)) return 'اليوم'
  if (isTomorrow(date)) return 'غداً'
  return format(date, 'EEEE', { locale: ar })
}

export const isOverdue = (dateStr: string): boolean =>
  isPast(new Date(dateStr)) && !isToday(new Date(dateStr))
