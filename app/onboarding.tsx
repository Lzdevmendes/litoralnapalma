import { useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions, Animated, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserMode } from '@/context/user-mode-context';
import { useLanguage } from '@/context/language-context';
import type { UserMode } from '@/lib/types';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';

const SLIDE_COLORS = ['#0077b6', '#0096c7', '#023e8a'] as const;

const FEATURES = [
  { emoji: '🏖️', labelPt: 'Praias',    labelEn: 'Beaches',  descPt: 'Lotação e qualidade da água',   descEn: 'Occupancy & water quality' },
  { emoji: '🚗', labelPt: 'Trânsito',  labelEn: 'Traffic',  descPt: 'Tempo real nas rodovias',       descEn: 'Live highway updates' },
  { emoji: '🏥', labelPt: 'Saúde',     labelEn: 'Health',   descPt: 'Espera nas UPAs da região',     descEn: 'Urgent care wait times' },
  { emoji: '🌤️', labelPt: 'Clima',     labelEn: 'Weather',  descPt: 'Temperatura e condições',       descEn: 'Temperature & conditions' },
] as const;

const CITIES = [
  { name: 'Caraguatatuba', emoji: '🌊' },
  { name: 'São Sebastião', emoji: '⛵' },
  { name: 'Ubatuba',       emoji: '🏄' },
  { name: 'Ilhabela',      emoji: '🏝️' },
] as const;

const MODE_OPTIONS: {
  mode: UserMode;
  emoji: string;
  titlePt: string; titleEn: string;
  descPt: string;  descEn: string;
  previewPt: string[]; previewEn: string[];
}[] = [
  {
    mode: 'morador',
    emoji: '🏠',
    titlePt: 'Morador',
    titleEn: 'Resident',
    descPt: 'Moro aqui e uso o app no dia a dia',
    descEn: 'I live here and use the app daily',
    previewPt: ['Feira livre, farmácias e serviços', 'Ônibus e trânsito local', 'Alertas de proximidade'],
    previewEn: ['Farmer\'s market, pharmacies & services', 'Local buses & traffic', 'Geofence alerts'],
  },
  {
    mode: 'turista',
    emoji: '✈️',
    titlePt: 'Turista',
    titleEn: 'Tourist',
    descPt: 'Estou visitando o litoral norte',
    descEn: 'I\'m visiting the North Coast',
    previewPt: ['Atrações, trilhas e cachoeiras', 'Restaurantes e passeios de barco', 'Roteiros alternativos'],
    previewEn: ['Attractions, trails & waterfalls', 'Restaurants & boat tours', 'Side routes & hidden spots'],
  },
];

export default function OnboardingScreen() {
  const { setMode } = useUserMode();
  const { locale } = useLanguage();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<UserMode>('morador');
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const pt = locale === 'pt';

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

      {/* Botão pular */}
      <Animated.View
        pointerEvents={step === 2 ? 'none' : 'auto'}
        style={{
          position: 'absolute', top: insets.top + 16, right: 24, zIndex: 20,
          opacity: skipOpacity,
        }}
      >
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>
            {pt ? 'Pular' : 'Skip'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Slides */}
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
          <Text style={{ fontSize: 80, marginBottom: 24 }}>🌊</Text>

          <Text style={{
            fontSize: 34, fontWeight: '800', color: '#fff',
            textAlign: 'center', lineHeight: 42, letterSpacing: -0.5,
          }}>
            {pt ? 'Bem-vindo ao\nLitoral na Palma' : 'Welcome to\nLitoral na Palma'}
          </Text>

          <Text style={{
            fontSize: 16, color: 'rgba(255,255,255,0.78)',
            textAlign: 'center', marginTop: 16, lineHeight: 25,
          }}>
            {pt
              ? 'Tudo sobre praias, trânsito e serviços\ndo litoral norte de São Paulo.'
              : 'Beaches, traffic & local services\non the North Coast of São Paulo.'}
          </Text>

          {/* 4 cidades */}
          <View style={{ marginTop: 28, gap: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1.2 }}>
              {pt ? '4 cidades cobertas' : '4 cities covered'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {CITIES.map((c) => (
                <View key={c.name} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8,
                }}>
                  <Text style={{ fontSize: 15 }}>{c.emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 40 }}>
            {pt ? 'Deslize para continuar →' : 'Swipe to continue →'}
          </Text>
        </View>

        {/* ── Slide 2: Funcionalidades ──────────────────────────────────── */}
        <View style={{
          width, flex: 1, paddingHorizontal: 24,
          paddingTop: insets.top + 48, paddingBottom: BOTTOM_HEIGHT, alignItems: 'center',
        }}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>🧭</Text>

          <Text style={{
            fontSize: 32, fontWeight: '800', color: '#fff',
            textAlign: 'center', lineHeight: 40, letterSpacing: -0.5,
          }}>
            {pt ? 'Tudo em\num só lugar' : 'Everything\nin one place'}
          </Text>

          <Text style={{
            fontSize: 15, color: 'rgba(255,255,255,0.78)',
            textAlign: 'center', marginTop: 12, marginBottom: 28, lineHeight: 24,
          }}>
            {pt
              ? 'Sempre informado sobre o que\nimporta no litoral norte.'
              : 'Always up to date on what\nmatters on the North Coast.'}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: width - 48 }}>
            {FEATURES.map((f) => (
              <View key={f.labelPt} style={{
                width: (width - 48 - 12) / 2,
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: 20, padding: 18, alignItems: 'center', gap: 8,
              }}>
                <Text style={{ fontSize: 38 }}>{f.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                  {pt ? f.labelPt : f.labelEn}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', textAlign: 'center', lineHeight: 17 }}>
                  {pt ? f.descPt : f.descEn}
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
            fontSize: 32, fontWeight: '800', color: '#fff',
            textAlign: 'center', lineHeight: 40, letterSpacing: -0.5, marginBottom: 10,
          }}>
            {pt ? 'Como você usa\no litoral?' : 'How do you use\nthe coast?'}
          </Text>

          <Text style={{
            fontSize: 15, color: 'rgba(255,255,255,0.78)',
            textAlign: 'center', lineHeight: 24, marginBottom: 28,
          }}>
            {pt
              ? 'Escolha seu perfil — pode mudar\nnas configurações quando quiser.'
              : 'Pick your profile — you can change\nit anytime in Settings.'}
          </Text>

          <View style={{ gap: 14 }}>
            {MODE_OPTIONS.map(({ mode, emoji, titlePt, titleEn, descPt, descEn, previewPt, previewEn }) => {
              const active = selectedMode === mode;
              const preview = pt ? previewPt : previewEn;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  style={({ pressed }) => ({
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.22)'
                      : pressed ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: active ? 'rgba(255,255,255,0.85)' : 'transparent',
                    padding: 20,
                    gap: 12,
                  })}
                >
                  {/* Cabeçalho do card */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 56, height: 56, borderRadius: 16,
                      backgroundColor: active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 28 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 19, fontWeight: '800', color: '#fff' }}>
                        {pt ? titlePt : titleEn}
                      </Text>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', marginTop: 2 }}>
                        {pt ? descPt : descEn}
                      </Text>
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

                  {/* Preview do modo */}
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

      {/* Controles inferiores */}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20, gap: 14 }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          {SLIDE_COLORS.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View style={{
                height: 8,
                width: i === step ? 28 : 8,
                borderRadius: 4,
                backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.3)',
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
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: SLIDE_COLORS[2] }}>
            {step < 2
              ? (pt ? 'Próximo →' : 'Next →')
              : (pt ? '🚀  Começar' : '🚀  Get started')}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
