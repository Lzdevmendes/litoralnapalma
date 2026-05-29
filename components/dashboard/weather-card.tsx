import { View, Text } from 'react-native';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useWeather } from '@/hooks/useWeather';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import type { WeatherData } from '@/lib/types';

const CONDITION_EMOJI: Record<WeatherData['condition'], { emoji: string; bg: string }> = {
  ensolarado: { emoji: '☀️', bg: '#fef3c7' },
  parcial:    { emoji: '⛅', bg: '#f1f5f9' },
  nublado:    { emoji: '☁️', bg: '#e2e8f0' },
  chuva:      { emoji: '🌧️', bg: '#dbeafe' },
  trovoada:   { emoji: '⛈️', bg: '#ede9fe' },
};

export function WeatherCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data, isLoading, isError, error, refetch } = useWeather(city);

  if (isLoading) return <CardSkeleton />;
  if (isError || !data) return <ErrorCard error={error} onRetry={refetch} />;

  const cond = CONDITION_EMOJI[data.condition];
  const condLabel = t.weather.conditions[data.condition];

  return (
    <View
      style={{
        backgroundColor: cond.bg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
        boxShadow: '0 2px 12px rgba(0,119,182,0.08)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t.weather.label} · {city.name}
          </Text>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#0f172a', lineHeight: 56 }}>
            {data.temperature}°
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b' }}>{t.weather.feelsLike} {data.feelsLike}°</Text>
        </View>
        <Text style={{ fontSize: 52 }}>{cond.emoji}</Text>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
        {condLabel}
      </Text>

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
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: 12,
              padding: 10,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 16 }}>{emoji}</Text>
            <Text style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#374151' }}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
