import { View, Text } from 'react-native'
import { Wallet } from '@/types'
import { Colors } from '@/constants/colors'
import { formatAmountAr } from '@/utils/dateHelpers'
import { useAppStore } from '@/stores/useAppStore'

const WALLET_ICONS = { cash: '💵', bank: '🏦', ewallet: '📱' } as const
const WALLET_LABELS = { cash: 'كاش', bank: 'بنك', ewallet: 'محفظة إلكترونية' } as const

export function WalletCard({ wallet }: { wallet: Wallet }) {
  const balanceHidden = useAppStore((s) => s.settings.balanceHidden)

  return (
    <View style={{
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: Colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    }}
    >
      <Text style={{ fontSize: 36, marginLeft: 14 }}>
        {WALLET_ICONS[wallet.type]}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: Colors.textPrimary }}>
          {wallet.name}
        </Text>
        <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: Colors.textSecondary }}>
          {WALLET_LABELS[wallet.type]}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{
          fontFamily: 'Cairo-Bold',
          fontSize: 18,
          color: wallet.balance >= 0 ? Colors.textPrimary : Colors.danger,
        }}
        >
          {balanceHidden ? '••••' : formatAmountAr(wallet.balance)}
        </Text>
      </View>
    </View>
  )
}
