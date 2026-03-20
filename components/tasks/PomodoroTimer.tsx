import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Colors } from '@/constants/colors'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { useAppStore } from '@/stores/useAppStore'
import { AnimatedCard } from '@/components/ui/AnimatedCard'

type Mode = 'focus' | 'short' | 'long'

const SIZE = 260
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

export function PomodoroTimer() {
  const settings = useAppStore((s) => s.settings)
  const [mode, setMode] = useState<Mode>('focus')
  const [running, setRunning] = useState(false)

  const modeMinutes = useMemo(() => {
    if (mode === 'focus') return settings.pomodoroFocus
    if (mode === 'short') return settings.pomodoroShortBreak
    return settings.pomodoroLongBreak
  }, [mode, settings.pomodoroFocus, settings.pomodoroShortBreak, settings.pomodoroLongBreak])

  const [secondsLeft, setSecondsLeft] = useState(modeMinutes * 60)

  useEffect(() => {
    setSecondsLeft(modeMinutes * 60)
    setRunning(false)
  }, [modeMinutes, mode])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  const total = modeMinutes * 60
  // progress goes from 1 to 0 (counting down)
  const progress = total > 0 ? secondsLeft / total : 0
  const dashoffset = CIRC * (1 - progress)

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const ss = Math.floor(secondsLeft % 60).toString().padStart(2, '0')

  return (
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={0}>
        <View style={s.card}>
          <View style={s.modeRow}>
            {(['focus', 'short', 'long'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                activeOpacity={0.8}
                style={[s.modeBtn, mode === m && s.modeBtnActive]}
              >
                <Text style={[s.modeLabel, mode === m && s.modeLabelActive]}>
                  {m === 'focus' ? 'تركيز' : m === 'short' ? 'راحة قصيرة' : 'راحة طويلة'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.timerContainer}>
            <View style={s.timerBg}>
              <Svg width={SIZE} height={SIZE}>
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={Colors.primaryXPale} strokeWidth={STROKE} fill="none" />
                <Circle
                  cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                  stroke={mode === 'focus' ? Colors.primaryMid : Colors.primarySoft}
                  strokeWidth={STROKE} fill="none"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              </Svg>
            </View>

            <View style={s.timeTextContainer}>
               <Text style={s.timeText}>{mm}:{ss}</Text>
               <Text style={s.timeLabel}>{mode === 'focus' ? 'ركز في هدفك 🎯' : 'وقت الراحة ☕'}</Text>
            </View>
          </View>

          <View style={s.controls}>
            <View style={{ flex: 1 }}>
               <PrimaryButton label={running ? 'إيقاف' : 'ابدأ'} onPress={() => setRunning((v) => !v)} />
            </View>
            <View style={{ flex: 1 }}>
               <PrimaryButton label="إعادة" variant="outline" onPress={() => { setRunning(false); setSecondsLeft(modeMinutes * 60); }} />
            </View>
          </View>
        </View>
      </AnimatedCard>
    </ScrollView>
  )
}

import { ScrollView } from 'react-native'

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryXPale,
    borderRadius: 20,
    padding: 6,
    marginBottom: 36,
    width: '100%',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  modeLabel: { fontFamily: 'Cairo-Bold', fontSize: 13, color: Colors.textSecondary },
  modeLabelActive: { color: Colors.primary },
  timerContainer: {
    width: SIZE, height: SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  timerBg: {
    width: SIZE, height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },
  timeTextContainer: { position: 'absolute', alignItems: 'center' },
  timeText: { fontFamily: 'Cairo-Bold', fontSize: 56, color: Colors.textPrimary, letterSpacing: 2 },
  timeLabel: { fontFamily: 'Cairo-SemiBold', fontSize: 16, color: Colors.textSecondary, marginTop: -4 },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
    width: '100%',
  },
})
