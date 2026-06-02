import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useTraffic } from '@/hooks/useTraffic';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { trafficLevelColor, timeAgo } from '@/lib/utils';
import { C, R, CARD_BASE } from '@/lib/design';

const LEVEL_FILL = { livre: 12, moderado: 42, lento: 70, parado: 100 } as const;

export function TrafficCard() {
  const { city } = useCity();
  const { locale, t } = useLanguage();
  const { data: routes, isLoading, isError, error, refetch } = useTraffic(city);

  if (isLoading) return <CardSkeleton />;
  if (isError || !routes) return <ErrorCard error={error} onRetry={refetch} />;

  const order = { livre: 0, moderado: 1, lento: 2, parado: 3 } as const;
  const worst = routes.reduce((a, b) => (order[b.level] > order[a.level] ? b : a));
  const worstColor = trafficLevelColor(worst.level);

  return (
    <View style={CARD_BASE}>
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 4, height: 14, borderRadius: 2, backgroundColor: worstColor }} />
          <View style={{
            width: 34, height: 34, borderRadius: R.icon,
            backgroundColor: `${worstColor}12`,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 17 }}>🚗</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>{t.traffic.label}</Text>
        </View>
        <Badge color={worstColor} dot>
          {t.traffic.levels[worst.level]}
        </Badge>
      </View>

      {/* Rotas */}
      <View style={{ gap: 8 }}>
        {routes.map((route) => {
          const color = trafficLevelColor(route.level);
          const fill = LEVEL_FILL[route.level];
          return (
            <View
              key={route.id}
              style={{
                backgroundColor: C.primary08,
                borderRadius: 14,
                padding: 12,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.textPrimary }}>
                  {route.shortName}
                </Text>
                <Badge color={color}>{t.traffic.levels[route.level]}</Badge>
              </View>

              {/* Barra de nível */}
              <View style={{ height: 5, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  height: '100%', width: `${fill}%`,
                  backgroundColor: color, borderRadius: 3,
                }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 11, color: C.textSecondary }}>⏱ {route.travelTime} min</Text>
                <Text style={{ fontSize: 11, color: C.textSecondary }}>📍 {route.distance} km</Text>
                <Text style={{ fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>
                  {timeAgo(route.updatedAt, locale)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
