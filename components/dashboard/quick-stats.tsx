import { Pressable, ScrollView, View, Text } from 'react-native';
import { useWeather } from '@/hooks/useWeather';
import { useBeaches } from '@/hooks/useBeaches';
import { useTraffic } from '@/hooks/useTraffic';
import { useUPA } from '@/hooks/useUPA';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { trafficLevelColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { C } from '@/lib/design';

interface QuickStatsProps {
  onStatPress?: (section: 'weather' | 'traffic' | 'beaches' | 'health') => void;
}

export function QuickStats({ onStatPress }: QuickStatsProps) {
  const { city } = useCity();
  const { t } = useLanguage();
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
          <Skeleton key={i} style={{ width: 100, height: 86, borderRadius: 18 }} />
        ))}
      </ScrollView>
    );
  }

  const order = { livre: 0, moderado: 1, lento: 2, parado: 3 } as const;
  const worstRoute = traffic?.reduce((a, b) => (order[b.level] > order[a.level] ? b : a));
  const freeBeaches = beaches?.filter((b) => b.occupancy === 'vazia').length ?? 0;
  const totalBeaches = beaches?.length ?? 0;
  const firstUPA = upas && upas.length > 0 ? upas[0] : null;

  const upaStatusColor = firstUPA
    ? ({ normal: C.success, alerta: C.warning, critico: C.danger } as const)[firstUPA.status]
    : C.textMuted;

  const stats = [
    {
      emoji: '🌡️',
      label: t.quickStats.temperature,
      section: 'weather' as const,
      value: weather ? `${weather.temperature}°` : '—',
      sub: weather ? `↑ ${weather.feelsLike}°` : '',
      color: '#f59e0b',
    },
    {
      emoji: '🚗',
      label: t.quickStats.traffic,
      section: 'traffic' as const,
      value: worstRoute ? t.traffic.levels[worstRoute.level] : '—',
      sub: worstRoute ? worstRoute.shortName : '',
      color: worstRoute ? trafficLevelColor(worstRoute.level) : C.textMuted,
    },
    {
      emoji: '🏖️',
      label: t.quickStats.freeBeaches,
      section: 'beaches' as const,
      value: beaches ? `${freeBeaches}/${totalBeaches}` : '—',
      sub: beaches ? `${Math.round((freeBeaches / totalBeaches) * 100)}%` : '',
      color: freeBeaches > 0 ? C.success : C.warning,
    },
    {
      emoji: '🏥',
      label: t.quickStats.upa,
      section: 'health' as const,
      value: firstUPA ? t.upa.status[firstUPA.status] : 'N/A',
      sub: firstUPA ? `${firstUPA.waitTime} min` : '',
      color: upaStatusColor,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
    >
      {stats.map(({ emoji, label, value, sub, color, section }) => (
        <Pressable
          key={label}
          onPress={() => onStatPress?.(section)}
          style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
            alignItems: 'center',
            gap: 3,
            minWidth: 96,
            borderWidth: 1,
            borderColor: `${color}22`,
            boxShadow: `0 2px 10px ${color}14`,
          }}
        >
          {/* Dot indicator */}
          <View style={{
            width: 6, height: 6, borderRadius: 3,
            backgroundColor: color, marginBottom: 2,
          }} />
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
          <Text style={{ fontSize: 15, fontWeight: '800', color, lineHeight: 18 }}>{value}</Text>
          <Text style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Text>
          {sub ? (
            <Text style={{ fontSize: 10, color, fontWeight: '600' }}>{sub}</Text>
          ) : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}
