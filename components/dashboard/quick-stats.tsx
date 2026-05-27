import { ScrollView, View, Text } from 'react-native';
import { useWeather } from '@/hooks/useWeather';
import { useBeaches } from '@/hooks/useBeaches';
import { useTraffic } from '@/hooks/useTraffic';
import { useUPA } from '@/hooks/useUPA';
import { useCity } from '@/context/city-context';
import { trafficLevelColor, occupancyColor } from '@/lib/utils';

export function QuickStats() {
  const { city } = useCity();
  const { data: weather } = useWeather(city);
  const { data: beaches } = useBeaches(city);
  const { data: traffic } = useTraffic(city);
  const { data: upas } = useUPA(city);

  const order = { livre: 0, moderado: 1, lento: 2, parado: 3 } as const;
  const worstRoute = traffic?.reduce((a, b) => (order[b.level] > order[a.level] ? b : a));
  const freeBeaches = beaches?.filter((b) => b.occupancy === 'vazia').length ?? 0;
  const totalBeaches = beaches?.length ?? 0;
  const upaStatus = upas?.[0]?.status ?? 'normal';

  const stats = [
    {
      emoji: '🌡️',
      label: 'Temperatura',
      value: weather ? `${weather.temperature}°C` : '---',
      color: '#f59e0b',
    },
    {
      emoji: '🚗',
      label: 'Trânsito',
      value: worstRoute
        ? ({ livre: 'Livre', moderado: 'Moderado', lento: 'Lento', parado: 'Parado' }[worstRoute.level])
        : '---',
      color: worstRoute ? trafficLevelColor(worstRoute.level) : '#94a3b8',
    },
    {
      emoji: '🏖️',
      label: 'Praias Livres',
      value: beaches ? `${freeBeaches}/${totalBeaches}` : '---',
      color: freeBeaches > 0 ? '#22c55e' : '#f59e0b',
    },
    {
      emoji: '🏥',
      label: 'UPA',
      value: { normal: 'Normal', alerta: 'Alerta', critico: 'Crítico' }[upaStatus],
      color: { normal: '#22c55e', alerta: '#f59e0b', critico: '#ef4444' }[upaStatus],
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {stats.map(({ emoji, label, value, color }) => (
        <View
          key={label}
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 10,
            alignItems: 'center',
            gap: 3,
            minWidth: 80,
            borderWidth: 1,
            borderColor: `${color}22`,
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color }}>{value}</Text>
          <Text style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
