import { View, Text } from 'react-native';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';
import { useCity } from '@/context/city-context';
import type { WeatherData } from '@/lib/types';

const CONDITION: Record<WeatherData['condition'], { emoji: string; label: string; bg: string }> = {
  ensolarado: { emoji: '☀️', label: 'Ensolarado', bg: '#fef3c7' },
  parcial: { emoji: '⛅', label: 'Parcialmente Nublado', bg: '#f1f5f9' },
  nublado: { emoji: '☁️', label: 'Nublado', bg: '#e2e8f0' },
  chuva: { emoji: '🌧️', label: 'Chuva', bg: '#dbeafe' },
  trovoada: { emoji: '⛈️', label: 'Trovoada', bg: '#ede9fe' },
};

function uvLabel(uv: number) {
  if (uv <= 2) return { label: 'Baixo', color: '#22c55e' };
  if (uv <= 5) return { label: 'Moderado', color: '#f59e0b' };
  if (uv <= 7) return { label: 'Alto', color: '#f97316' };
  if (uv <= 10) return { label: 'Muito Alto', color: '#ef4444' };
  return { label: 'Extremo', color: '#7c3aed' };
}

export function WeatherCard() {
  const { city } = useCity();
  const { data, isLoading } = useWeather(city);

  if (isLoading || !data) return <CardSkeleton />;

  const cond = CONDITION[data.condition];
  const uv = uvLabel(data.uvIndex);

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
            Clima Agora · {city.name}
          </Text>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#0f172a', lineHeight: 56 }}>
            {data.temperature}°
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b' }}>Sensação {data.feelsLike}°</Text>
        </View>
        <Text style={{ fontSize: 52 }}>{cond.emoji}</Text>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
        {cond.label}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { label: 'Umidade', value: `${data.humidity}%`, emoji: '💧' },
          { label: 'Vento', value: `${data.windSpeed} km/h`, emoji: '💨' },
          { label: 'UV', value: uv.label, emoji: '🔆', color: uv.color },
        ].map(({ label, value, emoji, color }) => (
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
            <Text style={{ fontSize: 11, fontWeight: '700', color: color ?? '#374151' }}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
