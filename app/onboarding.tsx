import { useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions, Animated, ScrollView } from 'react-native';
import { LogoSymbol } from '@/components/ui/logo-symbol';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserMode } from '@/context/user-mode-context';
import { useLanguage } from '@/context/language-context';
import { VideoBackground } from '@/components/ui/video-background';
import type { UserMode } from '@/lib/types';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const beachVideo = require('../assets/videos/beach.mp4');

const SLIDE_TINTS = [
  'rgba(0,60,100,0.55)',
  'rgba(0,80,110,0.52)',
  'rgba(2,30,80,0.60)',
] as const;

const SLIDE_COLORS = ['#0077b6', '#0096c7', '#023e8a'] as const;

const CITIES = [
  { name: 'Caraguatatuba', emoji: '🌊' },
  { name: 'São Sebastião', emoji: '⛵' },
  { name: 'Ubatuba',       emoji: '🏄' },
  { name: 'Ilhabela',      emoji: '🏝️' },
] as const;

export default function OnboardingScreen() {
  const { setMode } = useUserMode();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<UserMode>('morador');
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const FEATURES = [
    { emoji: '🏖️', label: t.onboarding.beachLabel,   desc: t.onboarding.beachDesc },
    { emoji: '🚗', label: t.onboarding.trafficLabel, desc: t.onboarding.trafficDesc },
    { emoji: '🏥', label: t.onboarding.healthLabel,  desc: t.onboarding.healthDesc },
    { emoji: '🌤️', label: t.onboarding.weatherLabel, desc: t.onboarding.weatherDesc },
  ];

  const MODE_OPTIONS: { mode: UserMode; emoji: string; title: string; desc: string; preview: string[] }[] = [
    {
      mode: 'morador',
      emoji: '🏠',
      title: t.onboarding.residentTitle,
      desc: t.onboarding.residentDesc,
      preview: [t.onboarding.residentPreview1, t.onboarding.residentPreview2, t.onboarding.residentPreview3],
    },
    {
      mode: 'turista',
      emoji: '✈️',
      title: t.onboarding.touristTitle,
      desc: t.onboarding.touristDesc,
      preview: [t.onboarding.touristPreview1, t.onboarding.touristPreview2, t.onboarding.touristPreview3],
    },
  ];

  const tintColor = scrollX.interpolate({
    inputRange: [0, width, width * 2],
    outputRange: [SLIDE_TINTS[0], SLIDE_TINTS[1], SLIDE_TINTS[2]],
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
    <View style={{ flex: 1, backgroundColor: '#001a2e' }}>

      {/* ── Camada 1: vídeo de praia em loop ─────────────────────────── */}
      <VideoBackground source={beachVideo} />

      {/* ── Camada 2: tint de cor animado por slide ────────────────────── */}
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tintColor }}
        pointerEvents="none"
      />

      {/* ── Camada 3: gradient escuro no rodapé ───────────────────────── */}
      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: BOTTOM_HEIGHT + 60,
          backgroundColor: 'rgba(0,10,30,0.72)',
        }}
        pointerEvents="none"
      />

      {/* ── Botão pular ───────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents={step === 2 ? 'none' : 'auto'}
        style={{
          position: 'absolute', top: insets.top + 16, right: 24, zIndex: 20,
          opacity: skipOpacity,
        }}
      >
        <Pressable
          onPress={finish}
          hitSlop={12}
          style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
            {t.onboarding.skip}
          </Text>
        </Pressable>
      </Animated.View>

      {/* ── Slides ────────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
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
        {/* ── Slide 1: Boas-vindas + 4 cidades ─────────────────────────── */}
        <View style={{
          width, flex: 1, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 28, paddingTop: insets.top + 48, paddingBottom: BOTTOM_HEIGHT,
        }}>
          <LogoSymbol size={80} style={{ marginBottom: 24 }} />

          <Text style={{
            fontSize: 36, fontWeight: '800', color: '#fff',
            textAlign: 'center', lineHeight: 44, letterSpacing: -0.8,
            textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
          }}>
            {t.onboarding.welcome}
          </Text>

          <Text style={{
            fontSize: 16, color: 'rgba(255,255,255,0.85)',
            textAlign: 'center', marginTop: 16, lineHeight: 25,
            textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
          }}>
            {t.onboarding.welcomeDesc}
          </Text>

          {/* 4 cidades */}
          <View style={{ marginTop: 32, gap: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.2 }}>
              {t.onboarding.citiesLabel}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {CITIES.map((c) => (
                <View key={c.name} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 100, paddingHorizontal: 14, paddingVertical: 9,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
                }}>
                  <Text style={{ fontSize: 15 }}>{c.emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 44 }}>
            {t.onboarding.swipe}
          </Text>
        </View>

        {/* ── Slide 2: Funcionalidades ──────────────────────────────────── */}
        <View style={{
          width, flex: 1, paddingHorizontal: 24,
          paddingTop: insets.top + 48, paddingBottom: BOTTOM_HEIGHT, alignItems: 'center',
        }}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>🧭</Text>

          <Text style={{
            fontSize: 34, fontWeight: '800', color: '#fff',
            textAlign: 'center', lineHeight: 42, letterSpacing: -0.8,
            textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
          }}>
            {t.onboarding.featuresTitle}
          </Text>

          <Text style={{
            fontSize: 15, color: 'rgba(255,255,255,0.82)',
            textAlign: 'center', marginTop: 12, marginBottom: 28, lineHeight: 24,
          }}>
            {t.onboarding.featuresDesc}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: width - 48 }}>
            {FEATURES.map((f) => (
              <View key={f.label} style={{
                width: (width - 48 - 12) / 2,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 20, padding: 18, alignItems: 'center', gap: 8,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
              }}>
                <Text style={{ fontSize: 38 }}>{f.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{f.label}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 17 }}>
                  {f.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Slide 3: Escolha de modo ──────────────────────────────────── */}
        <View style={{
          width, flex: 1, paddingHorizontal: 24,
          paddingTop: insets.top + 40, paddingBottom: BOTTOM_HEIGHT,
        }}>
          <Text style={{
            fontSize: 34, fontWeight: '800', color: '#fff',
            textAlign: 'center', lineHeight: 42, letterSpacing: -0.8, marginBottom: 10,
            textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
          }}>
            {t.onboarding.modeTitle}
          </Text>

          <Text style={{
            fontSize: 15, color: 'rgba(255,255,255,0.82)',
            textAlign: 'center', lineHeight: 24, marginBottom: 28,
          }}>
            {t.onboarding.modeDesc}
          </Text>

          <View style={{ gap: 14 }}>
            {MODE_OPTIONS.map(({ mode, emoji, title, desc, preview }) => {
              const active = selectedMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  style={({ pressed }) => ({
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.20)'
                      : pressed ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)',
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.15)',
                    padding: 20, gap: 12,
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 56, height: 56, borderRadius: 16,
                      backgroundColor: active ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.10)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 28 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 19, fontWeight: '800', color: '#fff' }}>{title}</Text>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', marginTop: 2 }}>{desc}</Text>
                    </View>
                    {active && (
                      <View style={{
                        width: 26, height: 26, borderRadius: 13,
                        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 13, color: SLIDE_COLORS[2], fontWeight: '800' }}>✓</Text>
                      </View>
                    )}
                  </View>

                  {active && (
                    <View style={{ gap: 5, paddingLeft: 4 }}>
                      {preview.map((item) => (
                        <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' }} />
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.80)', lineHeight: 18 }}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ── Controles inferiores com blur ─────────────────────────────── */}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            height: 24,
            marginBottom: 12,
            borderRadius: 12,
            overflow: 'hidden',
            marginHorizontal: -24,
          }}
        />

        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          {SLIDE_COLORS.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View style={{
                height: 8,
                width: i === step ? 28 : 8,
                borderRadius: 4,
                backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.35)',
              }} />
            </Pressable>
          ))}
        </View>

        {/* Botão próximo / começar */}
        <Pressable
          onPress={step < 2 ? () => goTo(step + 1) : finish}
          style={({ pressed }) => ({
            paddingVertical: 18, borderRadius: 18,
            backgroundColor: pressed ? 'rgba(255,255,255,0.88)' : '#fff',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.30)',
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: SLIDE_COLORS[2] }}>
            {step < 2 ? t.onboarding.next : t.onboarding.start}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
