import React, { useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title: string
  snapPoints?: string[] | number[]
  children: React.ReactNode
}

export function BottomSheet({ visible, onClose, title, snapPoints = ['60%', '95%'], children }: BottomSheetProps) {
  const ref    = useRef<BottomSheetModal>(null)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (visible) ref.current?.present()
    else ref.current?.dismiss()
  }, [visible])

  const backdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.45}
      pressBehavior="close"
    />
  ), [])

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={backdrop}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 32 }}
      handleIndicatorStyle={{
        width: 44, height: 5,
        backgroundColor: '#CBD5C0',
        marginTop: 10,
      }}
      animationConfigs={{
        damping: 20, stiffness: 200,
        mass: 0.8,
      }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EFF4F0',
      }}>
        <TouchableOpacity onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15, color: '#DC2626' }}>
            إلغاء
          </Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 17, color: '#0D1B12' }}>
          {title}
        </Text>
        <View style={{ width: 52 }} />
      </View>

      {/* Content */}
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 60 + insets.bottom,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
