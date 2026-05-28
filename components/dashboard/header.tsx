import { useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { useUserMode } from '@/context/user-mode-context';
import { CITIES } from '@/data/cities';
import type { UserMode } from '@/lib/types';

const BLUE = '#0077b6';

export function Header() {
  const queryClient = useQueryClient();
  const { city, setCity } = useCity();
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useUserMode();
  const rotation = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  async function handleRefresh() {
    rotation.setValue(0);
    spinRef.current = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 800, useNativeDriver: true })
    );
    spinRef.current.start();
    await queryClient.invalidateQueries();
    spinRef.current?.stop();
    spinRef.current = null;
    rotation.setValue(0);
  }

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,119,182,0.08)',
        boxShadow: '0 1px 8px rgba(0,119,182,0.06)',
      }}
    >
      {/* Linha principal */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          gap: 8,
        }}
      >
        {/* Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: BLUE,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,119,182,0.35)',
            }}
          >
            <Text style={{ fontSize: 20 }}>🧭</Text>
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: BLUE, letterSpacing: -0.2 }}>
              Litoral na Palma
            </Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>📍 {city.name}, SP</Text>
          </View>
        </View>

        {/* Mode toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#f1f5f9',
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {(['morador', 'turista'] as UserMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 9,
                backgroundColor: mode === m ? BLUE : 'transparent',
                boxShadow: mode === m ? '0 1px 4px rgba(0,119,182,0.3)' : undefined,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: mode === m ? '#fff' : '#64748b',
                }}
              >
                {m === 'morador' ? t.header.resident : t.header.tourist}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Language toggle */}
        <Pressable
          onPress={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: pressed ? `${BLUE}20` : `${BLUE}10`,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 18 }}>{locale === 'pt' ? '🇧🇷' : '🇺🇸'}</Text>
        </Pressable>

        {/* Refresh */}
        <Pressable
          onPress={handleRefresh}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: `${BLUE}10`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.Text style={[{ fontSize: 16 }, { transform: [{ rotate: spin }] }]}>
            🔄
          </Animated.Text>
        </Pressable>
      </View>

      {/* Seletor de município */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingBottom: 10 }}
      >
        {CITIES.map((c) => {
          const active = c.id === city.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCity(c)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: active ? BLUE : `${BLUE}10`,
                borderWidth: 1,
                borderColor: active ? BLUE : `${BLUE}28`,
                boxShadow: active ? '0 2px 8px rgba(0,119,182,0.25)' : undefined,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: active ? '#fff' : BLUE,
                }}
              >
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
