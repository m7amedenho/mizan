import { View, Text, TouchableOpacity } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Transaction } from '@/types'
import { Colors } from '@/constants/colors'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { formatAmountAr } from '@/utils/dateHelpers'

const CAT_COLORS: Record<string, string> = {
  food: '#F97316',
  transport: '#F59E0B',
  shopping: '#EC4899',
  bills: '#38BDF8',
  entertainment: '#8B5CF6',
  education: '#6366F1',
  health: '#22C55E',
  other: '#94A3B8',
  salary: '#22C55E',
  freelance: '#38BDF8',
  gift: '#EC4899',
  investment: '#F59E0B',
}

export function TransactionItem({ transaction: tx, onDelete }: { transaction: Transaction; onDelete: () => void }) {
  const translateX = useSharedValue(0)
  const categories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
  const cat = categories.find((c) => c.key === tx.category)

  const swipe = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) translateX.value = Math.max(e.translationX, -70)
    })
    .onEnd((e) => {
      if (e.translationX < -50) {
        translateX.value = withSpring(-70)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }))

  return (
    <View style={{ position: 'relative', marginBottom: 8 }}>
      <View style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 70,
        backgroundColor: Colors.danger,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ fontSize: 20 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={swipe}>
        <Animated.View style={[style, {
          backgroundColor: Colors.surface,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: Colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }]}
        >
          <View style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: `${CAT_COLORS[tx.category] ?? '#94A3B8'}20`,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
          }}
          >
            <Text style={{ fontSize: 20 }}>{cat?.emoji ?? '📦'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: Colors.textPrimary }}>{tx.name}</Text>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary }}>{cat?.label ?? tx.category}</Text>
          </View>
          <Text style={{
            fontFamily: 'Cairo-Bold',
            fontSize: 15,
            color: tx.type === 'income' ? Colors.primaryMid : Colors.danger,
          }}
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatAmountAr(tx.amount)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
