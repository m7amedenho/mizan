import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { storage } from './storage'
import { getTodayString } from './dateHelpers'

const STORE_KEYS = [
  'app-store',
  'task-store',
  'habit-store',
  'finance-store',
  'project-store',
  'goal-store',
  'journal-store',
  'mood-store',
]

export const exportBackup = async (): Promise<boolean> => {
  try {
    const data: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      version: '1.1.0',
    }

    for (const key of STORE_KEYS) {
      const raw = storage.getItem(key)
      if (raw) {
        try {
          data[key] = JSON.parse(raw) as unknown
        } catch {
          data[key] = raw
        }
      }
    }

    const json = JSON.stringify(data, null, 2)
    const fileName = `mizan-backup-${getTodayString()}.json`
    const path = `${FileSystem.documentDirectory}${fileName}`

    await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 })

    const canShare = await Sharing.isAvailableAsync()
    if (canShare) {
      await Sharing.shareAsync(path, {
        mimeType: 'application/json',
        dialogTitle: 'حفظ نسخة احتياطية من ميزان',
      })
      return true
    }
    return false
  } catch (e) {
    console.error('Backup failed:', e)
    return false
  }
}

export const importBackup = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>
    if (!data || typeof data !== 'object') return false

    for (const key of STORE_KEYS) {
      if (data[key]) {
        storage.setItem(key, JSON.stringify(data[key]))
      }
    }
    return true
  } catch {
    return false
  }
}
