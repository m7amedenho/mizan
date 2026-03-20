import { StyleSheet } from 'react-native'
import { Colors } from './colors'

export const inputStyle = {
  backgroundColor: Colors.surface,
  borderWidth: 1.5,
  borderColor: Colors.border,
  borderRadius: 14,
  height: 52,
  paddingHorizontal: 16,
  fontFamily: 'Cairo-Regular',
  fontSize: 15,
  color: Colors.textPrimary,
} as const

export const inputLabel = {
  fontFamily: 'Cairo-SemiBold',
  fontSize: 13,
  color: Colors.textSecondary,
  marginBottom: 8,
  marginTop: 4,
} as const

export const sectionTitle = {
  fontFamily: 'Cairo-Bold',
  fontSize: 16,
  color: Colors.textPrimary,
  marginBottom: 12,
} as const

export const SharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
})

