import { useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions, Animated, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserMode } from '@/context/user-mode-context';
import type { UserMode } from '@/lib/types';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';

const SLIDE_COLORS = ['#0077b6', '#0096c7', '#023e8a'] as const;

const FEATURES = [
  { emoji: '🏖️', label: 'Praias',   desc: 'Lotação e qualidade da água' },
  { emoji: '🚗', label: 'Trânsito', desc: 'Tempo real nas rodovias' },
  { emoji: '🏥', label: 'Saúde',    desc: 'Espera nas UPAs da região' },
  { emoji: '🌤️', label: 'Clima',    desc: 'Temperatura, vento e nebulosidade' },
] as const;

const MODE_OPTIONS: { mode: UserMode; emoji: string; title: string; desc: string }[] = [
  { mode: 'morador', emoji: '🏠', title: 'Morador', desc: 'Moro aqui e uso o app no dia a dia' },
  { mode: 'turista', emoji: '✈️', title: 'Turista', desc: 'Estou visitando o litoral norte' },
];

export default function OnboardingScreen() {
  const { setMode } = useUserMode();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<UserMode>('morador');
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const bgColor = scrollX.interpolate({
    inputRange: [0, width, width * 2],
    outputRange: [SLIDE_COLORS[0], SLIDE_COLORS[1], SLIDE_COLORS[2]],
  });

  const skipOpacity = scrollX.interpolate({
    inputRange: [width, width * 1.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  function goTo(s: number) {
    scrollRef.current?.scrollTo({ x: s * width, animated: true });
    setStep(s);
  }

  async function finish() {
    setMode(selectedMode);
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    router.replace('/');
  }

  const BOTTOM_HEIGHT = insets.bottom + 96;

  return (
    <Animated.View style={{ flex: 1, backgroundColor: bgColor }}>

      {/* Botão pular — desaparece no último slide */}
      <Animated.View
        pointerEvents={step === 2 ? 'none' : 'auto'}
        style={{
          position: 'absolute',
          top: insets.top + 16,
          right: 24,
          zIndex: 20,
          opacity: skipOpacity,
        }}
      >
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>
            Pular
          </Text>
        </Pressable>
      </Animated.View>

      {/* Slides — swipe horizontal nativo */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          setStep(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'flex-start' }}
      >
        {/* ── Slide 1: Boas-vindas ─────────────────────────────────────────── */}
        <View
          style={{
            width,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            paddingTop: insets.top + 48,
            paddingBottom: BOTTOM_HEIGHT,
          }}
        >
          <Text style={{ fontSize: 88, marginBottom: 32 }}>🌊</Text>

          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: '#fff',
              textAlign: 'center',
              lineHeight: 44,
              letterSpacing: -0.5,
            }}
          >
            {'Bem-vindo ao\nLitoral na Palma'}
          </Text>

          <Text
            style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.78)',
              textAlign: 'center',
              marginTop: 20,
              lineHeight: 27,
            }}
          >
            {'Tudo sobre praias, trânsito e serviços\ndo litoral norte de São Paulo.'}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 40, justifyContent: 'center' }}>
            {FEATURES.map((f) => (
              <View
                key={f.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 100,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 16 }}>{f.emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{f.label}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 48 }}>
            Deslize para continuar →
          </Text>
        </View>

        {/* ── Slide 2: Funcionalidades ──────────────────────────────────────── */}
        <View
          style={{
            width,
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: insets.top + 48,
            paddingBottom: BOTTOM_HEIGHT,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 80, marginBottom: 24 }}>🧭</Text>

          <Text
            style={{
              fontSize: 34,
              fontWeight: '800',
              color: '#fff',
              textAlign: 'center',
              lineHeight: 42,
              letterSpacing: -0.5,
            }}
          >
            {'Tudo em\num só lugar'}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.78)',
              textAlign: 'center',
              marginTop: 14,
              marginBottom: 32,
              lineHeight: 25,
            }}
          >
            {'Sempre informado sobre o que\nimporta no litoral norte.'}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: width - 48 }}>
            {FEATURES.map((f) => (
              <View
                key={f.label}
                style={{
                  width: (width - 48 - 12) / 2,
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  borderRadius: 20,
                  padding: 20,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 40 }}>{f.emoji}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{f.label}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 18 }}>
                  {f.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Slide 3: Escolha de perfil ────────────────────────────────────── */}
        <View
          style={{
            width,
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: insets.top + 48,
            paddingBottom: BOTTOM_HEIGHT,
          }}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: '800',
              color: '#fff',
              textAlign: 'center',
              lineHeight: 42,
              letterSpacing: -0.5,
              marginBottom: 12,
            }}
          >
            {'Como você usa\no litoral?'}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.78)',
              textAlign: 'center',
              lineHeight: 25,
              marginBottom: 36,
            }}
          >
            {'Escolha seu perfil — você pode\nmudá-lo quando quiser.'}
          </Text>

          <View style={{ gap: 16 }}>
            {MODE_OPTIONS.map(({ mode, emoji, title, desc }) => {
              const active = selectedMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  style={({ pressed }) => ({
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.22)'
                      : pressed
                        ? 'rgba(255,255,255,0.10)'
                        : 'rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: active ? 'rgba(255,255,255,0.85)' : 'transparent',
                    padding: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                    minHeight: 88,
                  })}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 18,
                      backgroundColor: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>{emoji}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>{title}</Text>
                    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 20 }}>
                      {desc}
                    </Text>
                  </View>

                  {active && (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, color: SLIDE_COLORS[2] }}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ── Controles inferiores ──────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        {/* Dots — clicáveis para navegar */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          {SLIDE_COLORS.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View
                style={{
                  height: 8,
                  width: i === step ? 28 : 8,
                  borderRadius: 4,
                  backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              />
            </Pressable>
          ))}
        </View>

        {/* Botão Começar — só no último slide */}
        {step === 2 && (
          <Pressable
            onPress={finish}
            style={({ pressed }) => ({
              paddingVertical: 18,
              borderRadius: 18,
              backgroundColor: pressed ? 'rgba(255,255,255,0.9)' : '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 56,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            })}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: SLIDE_COLORS[2] }}>
              🚀  Começar
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
