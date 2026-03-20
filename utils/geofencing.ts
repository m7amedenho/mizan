import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import * as Notifications from 'expo-notifications'

const GEOFENCE_TASK = 'MIZAN_GEOFENCE_TASK'

void TaskManager
void Notifications
void GEOFENCE_TASK

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    if (results.length > 0) {
      const r = results[0]
      return [r.name, r.street, r.district, r.city].filter(Boolean).join('، ')
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return 'موقع غير معروف'
  }
}

export const getCurrentLocation = async (): Promise<{ lat: number; lng: number; placeName: string } | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return null
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    const placeName = await reverseGeocode(loc.coords.latitude, loc.coords.longitude)
    return { lat: loc.coords.latitude, lng: loc.coords.longitude, placeName }
  } catch {
    return null
  }
}

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status: fg } = await Location.requestForegroundPermissionsAsync()
  if (fg !== 'granted') return false
  const { status: bg } = await Location.requestBackgroundPermissionsAsync()
  return bg === 'granted'
}
