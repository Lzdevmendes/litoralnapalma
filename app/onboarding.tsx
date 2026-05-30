import { useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserMode } from '@/context/user-mode-context';
import type { UserMode } from '@/lib/types';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';

// ── Paleta por slide ──────────────────────────────────────────────────────────
const SLIDE_COLORS = ['#0077b6', '#0096c7', '#023e8a'] as const;

// ── Recursos exibidos no slide 2 ─────────────────────────────────────────────
const FEATURES = [
  { emoji: '🏖️', label: 'Praias',   desc: 'Lotação e qualidade da água' },
  { emoji: '🚗', label: 'Trânsito', desc: 'Tempo real nas rodovias' },
  { emoji: '🏥', label: 'Saúde',    desc: 'Espera nas UPAs da região' },
  { emoji: '🌤️', label: 'Clima',    desc: 'Temperatura, vento e nebulosidade' },
] as const;

// ── Cards de perfil no slide 3 ────────────────────────────────────────────────
const MODE_OPTIONS: { mode: UserMode; emoji: string; title: string; desc: string }[] = [
  { mode: 'morador', emoji: '🏠', title: 'Morador',  desc: 'Moro aqui e uso o app no dia a dia' },
  { mode: 'turista', emoji: '✈️', title: 'Turista',  desc: 'Estou visitando o litoral norte' },
];

export default function OnboardingScreen() {
  const { setMode } = useUserMode();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<UserMode>('morador');

  // Anima a posição horizontal dos slides (native driver)
  const slideAnim = useRef(new Animated.Value(0)).current;
  // Anima a cor de fundo (JS driver — backgroundColor não suporta native)
  const bgAnim = useRef(new Animated.Value(0)).current;

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [SLIDE_COLORS[0], SLIDE_COLORS[1], SLIDE_COLORS[2]],
  });

  const isLast = step === 2;

  function navigate(toStep: number) {
    setStep(toStep);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -toStep * width,
        useNativeDriver: true,
        damping: 22,
        stiffness: 160,
        overshootClamping: true,
      }),
      Animated.timing(bgAnim, {
        toValue: toStep,
        duration: 350,
        useNativeDriver: false,
      }),
    ]).start();
  }

  async function finish() {
    setMode(selectedMode);
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    router.replace('/');
  }

  // ── Altura reservada para os controles inferiores ─────────────────────────
  const BOTTOM_HEIGHT = insets.bottom + 120;

  return (
    <Animated.View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Botão pular — sempre visível nos slides 0 e 1 */}
      {!isLast && (
        <Pressable
          onPress={finish}
          hitSlop={12}
          style={{
            position: 'absolute',
            top: insets.top + 16,
            right: 24,
            zIndex: 20,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>
            Pular
          </Text>
        </Pressable>
      )}

      {/* Slides de conteúdo */}
      <Animated.View
        style={{
          flexDirection: 'row',
          width: width * 3,
          flex: 1,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* ── Slide 1: Boas-vindas ─────────────────────────────────────── */}
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

          {/* Chips decorativos */}
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
        </View>

        {/* ── Slide 2: Funcionalidades ─────────────────────────────────── */}
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

          {/* Grid 2 × 2 */}
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

        {/* ── Slide 3: Escolha de perfil ───────────────────────────────── */}
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
      </Animated.View>

      {/* ── Controles inferiores ─────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          {SLIDE_COLORS.map((_, i) => (
            <View
              key={i}
              style={{
                height: 8,
                width: i === step ? 28 : 8,
                borderRadius: 4,
                backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </View>

        {/* Botões de navegação */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {step > 0 && (
            <Pressable
              onPress={() => navigate(step - 1)}
              style={{
                flex: 1,
                paddingVertical: 18,
                borderRadius: 18,
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 56,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Voltar</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => (isLast ? finish() : navigate(step + 1))}
            style={({ pressed }) => ({
              flex: step > 0 ? 2 : 1,
              paddingVertical: 18,
              borderRadius: 18,
              backgroundColor: pressed ? 'rgba(255,255,255,0.9)' : '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 56,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            })}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: SLIDE_COLORS[step] }}>
              {isLast ? '🚀  Começar' : 'Próximo'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
