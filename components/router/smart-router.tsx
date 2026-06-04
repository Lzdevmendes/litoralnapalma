import { Pressable, View, Text, ScrollView, Linking } from 'react-native';
import { useTraffic } from '@/hooks/useTraffic';
import { useBeaches } from '@/hooks/useBeaches';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import type { SideRoute } from '@/lib/types';

const typeConfig: Record<SideRoute['type'], { emoji: string; color: string }> = {
  praia:     { emoji: '🏖️', color: '#0077b6' },
  trilha:    { emoji: '🥾', color: '#059669' },
  cachoeira: { emoji: '💧', color: '#0891b2' },
  cultural:  { emoji: '🏛️', color: '#7c3aed' },
};

export function SmartRouter() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: traffic } = useTraffic(city);
  const { data: beaches } = useBeaches(city);

  const order = { livre: 0, moderado: 1, lento: 2, parado: 3 } as const;
  const worstRoute = traffic?.reduce((a, b) => (order[b.level] > order[a.level] ? b : a));
  const congested = worstRoute ? order[worstRoute.level] >= 2 : false;
  const busyBeaches = beaches?.filter((b) => b.occupancy === 'lotada') ?? [];

  if (!congested && busyBeaches.length === 0) return null;

  const allRoutes = city.sideRoutes ?? [];
  const routes = congested
    ? allRoutes.filter((r) => r.type === 'trilha' || r.type === 'cachoeira' || r.type === 'cultural')
    : allRoutes.filter((r) => r.type === 'praia');

  if (routes.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#0077b6',
        borderWidth: 1,
        borderColor: 'rgba(0,119,182,0.15)',
        boxShadow: '0 2px 12px rgba(0,119,182,0.08)',
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: 'rgba(0,119,182,0.1)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>💡</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>{t.smartRouter.title}</Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {congested ? t.smartRouter.congestedMsg : t.smartRouter.crowdedMsg}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {routes.map((route) => {
          const cfg = typeConfig[route.type];
          return (
            <Pressable
              key={route.id}
              onPress={() => Linking.openURL(route.mapsUrl)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: pressed ? `${cfg.color}12` : 'rgba(0,0,0,0.03)',
                borderRadius: 16,
                padding: 12,
                gap: 12,
                width: 260,
                borderWidth: 1,
                borderColor: pressed ? `${cfg.color}28` : 'transparent',
              })}
            >
              <View
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: `${cfg.color}15`,
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 20 }}>{cfg.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }} numberOfLines={1}>
                  {route.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={2}>
                  {route.description}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>⏱ {route.estimatedTime} min</Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>📍 {route.distance} km</Text>
                  {route.difficulty && (
                    <View
                      style={{
                        paddingHorizontal: 6, paddingVertical: 2,
                        borderRadius: 6, backgroundColor: `${cfg.color}15`,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: cfg.color, fontWeight: '600' }}>
                        {route.difficulty}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={{ fontSize: 16, color: '#d1d5db', flexShrink: 0 }}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
