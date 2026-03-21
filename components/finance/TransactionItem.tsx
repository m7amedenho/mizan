import { View, Text, TouchableOpacity } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
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

const getTransactionMeta = (transaction: Transaction) => {
  if (transaction.flow === 'transfer') {
    return {
      emoji: '🔁',
      subtitle: 'تحويل بين المحافظ',
      color: Colors.primary,
      amountPrefix: '',
    }
  }

  const categories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
  const category = categories.find((item) => item.key === transaction.category)

  if (transaction.flow === 'debt_new') {
    return {
      emoji: transaction.type === 'expense' ? '🤝' : '💸',
      subtitle: transaction.type === 'expense'
        ? `سلفة لشخص: ${transaction.personName ?? ''}`
        : `استلاف من: ${transaction.personName ?? ''}`,
      color: transaction.type === 'income' ? Colors.primaryMid : Colors.danger,
      amountPrefix: transaction.type === 'income' ? '+' : '-',
    }
  }

  if (transaction.flow === 'debt_payment') {
    return {
      emoji: transaction.type === 'income' ? '💚' : '❤️',
      subtitle: transaction.type === 'income'
        ? `تحصيل دين: ${transaction.personName ?? ''}`
        : `سداد دين: ${transaction.personName ?? ''}`,
      color: transaction.type === 'income' ? Colors.primaryMid : Colors.danger,
      amountPrefix: transaction.type === 'income' ? '+' : '-',
    }
  }

  return {
    emoji: category?.emoji ?? '📦',
    subtitle: category?.label ?? transaction.category,
    color: transaction.type === 'income' ? Colors.primaryMid : Colors.danger,
    amountPrefix: transaction.type === 'income' ? '+' : '-',
  }
}

export function TransactionItem({ transaction, onDelete }: { transaction: Transaction; onDelete: () => void }) {
  const translateX = useSharedValue(0)
  const meta = getTransactionMeta(transaction)

  const swipe = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) translateX.value = Math.max(event.translationX, -82)
    })
    .onEnd((event) => {
      translateX.value = withSpring(event.translationX < -50 ? -82 : 0)
    })

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }))

  return (
    <View style={{ position: 'relative', marginBottom: 8 }}>
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 82,
          backgroundColor: Colors.danger,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity onPress={onDelete} style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 20 }}>🗑️</Text>
          <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: '#fff' }}>حذف</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={swipe}>
        <Animated.View
          style={[
            style,
            {
              backgroundColor: Colors.surface,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: Colors.border,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: `${CAT_COLORS[transaction.category] ?? Colors.primary}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: Colors.textPrimary }}>{transaction.name}</Text>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary }}>
              {meta.subtitle}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 15, color: meta.color }}>
            {meta.amountPrefix}
            {formatAmountAr(transaction.amount)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
