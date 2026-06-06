import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useWeather } from '@/hooks/useWeather';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { C, R, CARD_BASE } from '@/lib/design';
import type { WeatherData } from '@/lib/types';

const CONDITION: Record<WeatherData['condition'], { emoji: string; color: string; bg: string; border: string; ink: string }> = {
  ensolarado: { emoji: '☀️', color: '#f59e0b', bg: '#fff8e1', border: '#fde68a', ink: '#713f12' },
  parcial:    { emoji: '⛅', color: '#0ea5e9', bg: '#eff6ff', border: '#bae6fd', ink: '#0f365e' },
  nublado:    { emoji: '☁️', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', ink: '#1e293b' },
  chuva:      { emoji: '🌧️', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', ink: '#172554' },
  trovoada:   { emoji: '⛈️', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', ink: '#2e1065' },
};

export function WeatherCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data, isLoading, isError, error, refetch } = useWeather(city);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data?.condition !== 'chuva' && data?.condition !== 'trovoada') return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [data?.condition, pulse]);

  const iconScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  if (isLoading) return <CardSkeleton />;
  if (isError || !data) return <ErrorCard error={error} onRetry={refetch} />;

  const cond = CONDITION[data.condition];

  return (
    <View style={{
      ...CARD_BASE,
      backgroundColor: cond.bg,
      borderColor: cond.border,
      boxShadow: `0 8px 24px ${cond.color}1f`,
    }}>
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{
          width: 4, height: 14, borderRadius: 2,
          backgroundColor: cond.color,
        }} />
        <Text style={{ fontSize: 12, fontWeight: '800', color: cond.ink, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {t.weather.label}
        </Text>
      </View>

      {/* Temperatura + condição */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 52, fontWeight: '800', color: cond.ink, lineHeight: 56 }}>
            {data.temperature}°
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cond.color }}>
            {t.weather.conditions[data.condition]}
          </Text>
          <Text style={{ fontSize: 12, color: C.textSecondary }}>
            {t.weather.feelsLike} {data.feelsLike}°
          </Text>
        </View>
        <Animated.Text style={{ fontSize: 56, lineHeight: 64, transform: [{ scale: iconScale }] }}>
          {cond.emoji}
        </Animated.Text>
      </View>

      {/* Chips de dados */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { label: t.weather.humidity, value: `${data.humidity}%`,      emoji: '💧' },
          { label: t.weather.wind,     value: `${data.windSpeed} km/h`, emoji: '💨' },
          { label: t.weather.clouds,   value: `${data.cloudCoverage}%`, emoji: '☁️' },
        ].map(({ label, value, emoji }) => (
          <View
            key={label}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.62)',
              borderRadius: R.chip,
              padding: 10,
              alignItems: 'center',
              gap: 3,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.72)',
            }}
          >
            <Text style={{ fontSize: 16 }}>{emoji}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }}>{value}</Text>
            <Text style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
