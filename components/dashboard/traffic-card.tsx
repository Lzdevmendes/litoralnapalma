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
  const otherRoutes = routes.filter((route) => route.id !== worst.id);

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

      <View
        style={{
          backgroundColor: `${worstColor}10`,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: `${worstColor}22`,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontSize: 12, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.traffic.mainRoute}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPrimary }}>
              {worst.shortName}
            </Text>
            <Text style={{ fontSize: 12, color: C.textSecondary }} numberOfLines={2}>
              {worst.name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: worstColor }}>
              {worst.travelTime}
            </Text>
            <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '700' }}>min</Text>
          </View>
        </View>

        <View style={{ height: 7, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${LEVEL_FILL[worst.level]}%`, backgroundColor: worstColor, borderRadius: 4 }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 11, color: C.textSecondary }}>📍 {worst.distance} km</Text>
          <Text style={{ fontSize: 11, color: C.textSecondary }}>🚦 {t.traffic.levels[worst.level]}</Text>
          <Text style={{ fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>
            {timeAgo(worst.updatedAt, locale)}
          </Text>
        </View>
      </View>

      {/* Rotas */}
      <View style={{ gap: 7 }}>
        {otherRoutes.map((route) => {
          const color = trafficLevelColor(route.level);
          const fill = LEVEL_FILL[route.level];
          return (
            <View
              key={route.id}
              style={{
                backgroundColor: C.surfaceAlt,
                borderRadius: 13,
                paddingHorizontal: 12,
                paddingVertical: 10,
                gap: 7,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }}>{route.shortName}</Text>
                  <Text style={{ fontSize: 10, color: C.textMuted }} numberOfLines={1}>{route.name}</Text>
                </View>
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
