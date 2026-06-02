import { View, Text } from 'react-native';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useWeather } from '@/hooks/useWeather';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { C, R, CARD_BASE } from '@/lib/design';
import type { WeatherData } from '@/lib/types';

const CONDITION: Record<WeatherData['condition'], { emoji: string; color: string }> = {
  ensolarado: { emoji: '☀️', color: '#f59e0b' },
  parcial:    { emoji: '⛅', color: '#64748b' },
  nublado:    { emoji: '☁️', color: '#94a3b8' },
  chuva:      { emoji: '🌧️', color: '#3b82f6' },
  trovoada:   { emoji: '⛈️', color: '#7c3aed' },
};

export function WeatherCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data, isLoading, isError, error, refetch } = useWeather(city);

  if (isLoading) return <CardSkeleton />;
  if (isError || !data) return <ErrorCard error={error} onRetry={refetch} />;

  const cond = CONDITION[data.condition];

  return (
    <View style={CARD_BASE}>
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{
          width: 4, height: 14, borderRadius: 2,
          backgroundColor: cond.color,
        }} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {t.weather.label}
        </Text>
      </View>

      {/* Temperatura + condição */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 52, fontWeight: '800', color: C.textPrimary, lineHeight: 56 }}>
            {data.temperature}°
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cond.color }}>
            {t.weather.conditions[data.condition]}
          </Text>
          <Text style={{ fontSize: 12, color: C.textSecondary }}>
            {t.weather.feelsLike} {data.feelsLike}°
          </Text>
        </View>
        <Text style={{ fontSize: 56, lineHeight: 64 }}>{cond.emoji}</Text>
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
              backgroundColor: C.primary08,
              borderRadius: R.chip,
              padding: 10,
              alignItems: 'center',
              gap: 3,
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
