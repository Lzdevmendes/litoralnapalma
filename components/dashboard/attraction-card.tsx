import { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useAttractions } from '@/hooks/useAttractions';
import { mapsNavigationUrl } from '@/lib/utils';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import type { AttractionType } from '@/data/cities';

const TYPE_ICON: Record<AttractionType, string> = {
  praia:     '🏖️',
  trilha:    '🥾',
  cachoeira: '💧',
  historico: '🏛️',
  mirante:   '🔭',
  parque:    '🌿',
};

const TYPE_COLOR: Record<AttractionType, string> = {
  praia:     '#0077b6',
  trilha:    '#16a34a',
  cachoeira: '#0891b2',
  historico: '#7c3aed',
  mirante:   '#d97706',
  parque:    '#15803d',
};

export function AttractionCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: attractions, isLoading, isError, error, refetch } = useAttractions(city);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <CardSkeleton />;
  if (isError || !attractions) return <ErrorCard error={error} onRetry={refetch} />;

  const sorted = [...attractions].sort((a, b) => b.rating - a.rating);
  const freeCount = attractions.filter((a) => a.entryFee === null).length;

  return (
    <View
      style={{
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(22,163,74,0.15)',
        boxShadow: '0 2px 12px rgba(22,163,74,0.08)',
        gap: 12,
      }}
    >
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(22,163,74,0.12)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>🗺️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.sections.attractions}</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>
              {attractions.length} {t.attraction.count} · {freeCount} {t.attraction.freeCount}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#16a34a', fontWeight: '600' }}>{city.name}</Text>
      </View>

      {/* Lista de atrações */}
      <View style={{ gap: 8 }}>
        {sorted.map((attraction) => {
          const isExpanded = expandedId === attraction.id;
          const color = TYPE_COLOR[attraction.type];
          const isFree = attraction.entryFee === null;

          return (
            <Pressable
              key={attraction.id}
              onPress={() => setExpandedId(isExpanded ? null : attraction.id)}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? `${color}10`
                  : isExpanded
                  ? `${color}08`
                  : 'rgba(255,255,255,0.85)',
                borderRadius: 14,
                padding: 12,
                borderWidth: isExpanded ? 1 : 0,
                borderColor: `${color}25`,
                gap: 6,
              })}
            >
              {/* Linha principal */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 22 }}>{TYPE_ICON[attraction.type]}</Text>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
                    {attraction.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {/* Tipo */}
                    <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: `${color}15` }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color }}>
                        {t.attraction.types[attraction.type]}
                      </Text>
                    </View>
                    {/* Avaliação */}
                    <Text style={{ fontSize: 10, color: '#f59e0b', fontWeight: '700' }}>★ {attraction.rating.toFixed(1)}</Text>
                  </View>
                </View>

                {/* Entrada */}
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  {isFree ? (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(22,163,74,0.12)' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#16a34a' }}>{t.attraction.free}</Text>
                    </View>
                  ) : (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.12)' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#d97706' }}>R$ {attraction.entryFee}</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 10, color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </View>

              {/* Expandido */}
              {isExpanded && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: `${color}18`,
                    paddingTop: 10,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#374151', lineHeight: 18 }}>
                    {attraction.description}
                  </Text>

                  {/* Dicas */}
                  <View style={{ gap: 5 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      💡 {t.attraction.tips}
                    </Text>
                    {attraction.tips.map((tip, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 10, color, fontWeight: '700' }}>•</Text>
                        <Text style={{ fontSize: 11, color: '#64748b', flex: 1, lineHeight: 16 }}>{tip}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Botão Maps */}
                  <Pressable
                    onPress={() => Linking.openURL(mapsNavigationUrl(attraction.lat, attraction.lng, attraction.name, city.name))}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? `${color}cc` : color,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 14 }}>📍</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{t.attraction.directions}</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
