import { useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { CITIES } from '@/data/cities';
import type { UserMode } from '@/lib/types';

interface HeaderProps {
  mode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

const BLUE = '#0077b6';

export function Header({ mode, onModeChange }: HeaderProps) {
  const queryClient = useQueryClient();
  const { city, setCity } = useCity();
  const { locale, setLocale, t } = useLanguage();
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
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,119,182,0.1)',
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
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: BLUE,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>🧭</Text>
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: BLUE }}>Litoral na Palma</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>📍 {city.name}, SP</Text>
          </View>
        </View>

        {/* Mode toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.06)',
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {(['morador', 'turista'] as UserMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => onModeChange(m)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 9,
                backgroundColor: mode === m ? BLUE : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
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
            width: 34,
            height: 34,
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
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: `${BLUE}12`,
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
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: active ? BLUE : `${BLUE}12`,
                borderWidth: 1,
                borderColor: active ? BLUE : `${BLUE}30`,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
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
