import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useTraffic } from '@/hooks/useTraffic';
import { useCity } from '@/context/city-context';
import { trafficLevelColor, trafficLevelLabel, timeAgo } from '@/lib/utils';

export function TrafficCard() {
  const { city } = useCity();
  const { data: routes, isLoading } = useTraffic(city);

  if (isLoading || !routes) return <CardSkeleton />;

  const order = { livre: 0, moderado: 1, lento: 2, parado: 3 } as const;
  const worst = routes.reduce((a, b) => (order[b.level] > order[a.level] ? b : a));

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,119,182,0.1)',
        boxShadow: '0 2px 12px rgba(0,119,182,0.08)',
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(0,119,182,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>🚗</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>Trânsito</Text>
        </View>
        <Badge color={trafficLevelColor(worst.level)} dot>
          {`${trafficLevelLabel(worst.level)} no geral`}
        </Badge>
      </View>

      <View style={{ gap: 8 }}>
        {routes.map((route) => {
          const color = trafficLevelColor(route.level);
          const fill = { livre: 15, moderado: 45, lento: 70, parado: 100 }[route.level];
          return (
            <View
              key={route.id}
              style={{
                backgroundColor: 'rgba(0,0,0,0.03)',
                borderRadius: 14,
                padding: 12,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{route.shortName}</Text>
                <Badge color={color}>{trafficLevelLabel(route.level)}</Badge>
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 12, color: '#64748b' }}>⏱ {route.travelTime} min</Text>
                <Text style={{ fontSize: 12, color: '#64748b' }}>📍 {route.distance} km</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{timeAgo(route.updatedAt)}</Text>
              </View>
              {/* Level bar */}
              <View style={{ height: 4, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${fill}%`, backgroundColor: color, borderRadius: 2 }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
