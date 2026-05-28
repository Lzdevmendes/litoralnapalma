import { ScrollView, View, Text } from 'react-native';
import { useWeather } from '@/hooks/useWeather';
import { useBeaches } from '@/hooks/useBeaches';
import { useTraffic } from '@/hooks/useTraffic';
import { useUPA } from '@/hooks/useUPA';
import { useCity } from '@/context/city-context';
import { trafficLevelColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function QuickStats() {
  const { city } = useCity();
  const { data: weather, isLoading: loadingWeather } = useWeather(city);
  const { data: beaches, isLoading: loadingBeaches } = useBeaches(city);
  const { data: traffic, isLoading: loadingTraffic } = useTraffic(city);
  const { data: upas, isLoading: loadingUPA } = useUPA(city);

  const isLoading = loadingWeather || loadingBeaches || loadingTraffic || loadingUPA;

  if (isLoading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} style={{ width: 96, height: 80, borderRadius: 16 }} />
        ))}
      </ScrollView>
    );
  }

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
      contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
    >
      {stats.map(({ emoji, label, value, color }) => (
        <View
          key={label}
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            alignItems: 'center',
            gap: 4,
            minWidth: 92,
            borderWidth: 1,
            borderColor: `${color}20`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
          {/* Valor grande e em destaque — regra: valor > label */}
          <Text style={{ fontSize: 16, fontWeight: '800', color, lineHeight: 20 }}>{value}</Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
