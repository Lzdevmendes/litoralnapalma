import { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useCity } from '@/context/city-context';
import type { Restaurant, RestaurantCategory } from '@/data/cities';

// ── helpers ──────────────────────────────────────────────────────────────────

type SortKey = 'preco' | 'avaliacao' | 'custo_beneficio';

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'] as const;
const PRICE_COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444'] as const;

const CATEGORY_LABEL: Record<RestaurantCategory, string> = {
  frutos_do_mar: '🦐 Frutos do Mar',
  pizza:         '🍕 Pizza',
  churrasco:     '🥩 Churrasco',
  variado:       '🍽️ Variado',
  cafe:          '☕ Café',
  bar:           '🍺 Bar',
};

function costBenefit(r: Restaurant) {
  return r.rating / r.priceRange;
}

function formatTicket(value: number) {
  return `R$ ${value.toFixed(0)}`;
}

// ── sub-componentes ───────────────────────────────────────────────────────────

function PriceBadge({ range }: { range: 1 | 2 | 3 | 4 }) {
  return (
    <View
      style={{
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 7,
        backgroundColor: `${PRICE_COLORS[range]}18`,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '800', color: PRICE_COLORS[range] }}>
        {PRICE_LABELS[range]}
      </Text>
    </View>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <Text style={{ fontSize: 11, color: '#f59e0b', fontWeight: '700' }}>
      ★ {rating.toFixed(1)}
    </Text>
  );
}

// ── gráfico de barras simples ─────────────────────────────────────────────────

function TicketBarChart({ restaurants }: { restaurants: Restaurant[] }) {
  const max = Math.max(...restaurants.map((r) => r.averageTicket));
  return (
    <View style={{ gap: 6 }}>
      {restaurants.map((r) => (
        <View key={r.id} style={{ gap: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#374151', flex: 1 }} numberOfLines={1}>{r.name}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: PRICE_COLORS[r.priceRange] }}>
              {formatTicket(r.averageTicket)}/pessoa
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                height: 8,
                width: `${(r.averageTicket / max) * 100}%`,
                backgroundColor: PRICE_COLORS[r.priceRange],
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── componente principal ──────────────────────────────────────────────────────

export function RestaurantCard() {
  const { city } = useCity();
  const { data: restaurants, isLoading, isError, error, refetch } = useRestaurants(city);
  const [showCompare, setShowCompare] = useState(false);
  const [filterCat, setFilterCat] = useState<RestaurantCategory | 'todas'>('todas');
  const [sortKey, setSortKey] = useState<SortKey>('custo_beneficio');

  if (isLoading) return <CardSkeleton />;
  if (isError || !restaurants) return <ErrorCard error={error} onRetry={refetch} />;

  // Top 3 por custo-benefício
  const top3 = [...restaurants]
    .sort((a, b) => costBenefit(b) - costBenefit(a))
    .slice(0, 3);

  // Para a comparação
  const filtered = filterCat === 'todas'
    ? restaurants
    : restaurants.filter((r) => r.category === filterCat);

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'preco') return a.averageTicket - b.averageTicket;
    if (sortKey === 'avaliacao') return b.rating - a.rating;
    return costBenefit(b) - costBenefit(a);
  });

  const categories = Array.from(new Set(restaurants.map((r) => r.category)));

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'custo_beneficio', label: 'Custo-benefício' },
    { key: 'avaliacao', label: 'Avaliação' },
    { key: 'preco', label: 'Preço ↑' },
  ];

  return (
    <View
      style={{
        backgroundColor: '#fff8f1',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(234,88,12,0.15)',
        boxShadow: '0 2px 12px rgba(234,88,12,0.08)',
        gap: 12,
      }}
    >
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(234,88,12,0.12)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>🍽️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>Restaurantes</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>{restaurants.length} opções · {city.name}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#ea580c', fontWeight: '600' }}>Top custo-benefício</Text>
      </View>

      {/* Top 3 */}
      <View style={{ gap: 8 }}>
        {top3.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => Linking.openURL(r.mapsUrl)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(234,88,12,0.08)' : 'rgba(255,255,255,0.85)',
              borderRadius: 14,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            })}
          >
            <Text style={{ fontSize: 20 }}>{CATEGORY_LABEL[r.category].split(' ')[0]}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
                {r.name}
              </Text>
              <Text style={{ fontSize: 10, color: '#94a3b8' }} numberOfLines={1}>
                {CATEGORY_LABEL[r.category].split(' ').slice(1).join(' ')} · {r.address.split(' - ')[1] ?? ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <PriceBadge range={r.priceRange} />
                <StarRating rating={r.rating} />
              </View>
              <Text style={{ fontSize: 11, color: '#64748b' }}>{formatTicket(r.averageTicket)}/pessoa</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Destaques do melhor */}
      {top3[0] && (
        <View
          style={{
            backgroundColor: 'rgba(234,88,12,0.06)',
            borderRadius: 12,
            padding: 10,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: '#ea580c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            ✨ Destaque — {top3[0].name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {top3[0].highlights.map((h) => (
              <View key={h} style={{ backgroundColor: 'rgba(234,88,12,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10, color: '#ea580c' }}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Toggle comparação */}
      <Pressable
        onPress={() => setShowCompare(!showCompare)}
        style={({ pressed }) => ({
          backgroundColor: showCompare ? '#ea580c' : 'rgba(234,88,12,0.1)',
          borderRadius: 12,
          paddingVertical: 10,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ fontSize: 12, fontWeight: '700', color: showCompare ? '#fff' : '#ea580c' }}>
          {showCompare ? '✕ Fechar comparação' : '⚖️ Comparar restaurantes'}
        </Text>
      </Pressable>

      {/* Seção de comparação */}
      {showCompare && (
        <View style={{ gap: 12 }}>
          {/* Filtro por categoria */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Categoria
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
              <Pressable
                onPress={() => setFilterCat('todas')}
                style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                  backgroundColor: filterCat === 'todas' ? '#ea580c' : 'rgba(234,88,12,0.08)',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: filterCat === 'todas' ? '#fff' : '#ea580c' }}>
                  Todas
                </Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setFilterCat(cat)}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                    backgroundColor: filterCat === cat ? '#ea580c' : 'rgba(234,88,12,0.08)',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: filterCat === cat ? '#fff' : '#ea580c' }}>
                    {CATEGORY_LABEL[cat].split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Ordenação */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Ordenar por
            </Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {sortOptions.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setSortKey(key)}
                  style={{
                    flex: 1, paddingVertical: 6, borderRadius: 10, alignItems: 'center',
                    backgroundColor: sortKey === key ? '#ea580c' : 'rgba(234,88,12,0.08)',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: sortKey === key ? '#fff' : '#ea580c' }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Gráfico de barras */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 14,
              padding: 12,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Ticket médio por pessoa
            </Text>
            <TicketBarChart restaurants={sorted} />
          </View>

          {/* Lista ordenada */}
          <View style={{ gap: 6 }}>
            {sorted.map((r, idx) => (
              <Pressable
                key={r.id}
                onPress={() => Linking.openURL(r.mapsUrl)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(234,88,12,0.06)' : 'transparent',
                  borderRadius: 10,
                  padding: 8,
                  gap: 8,
                })}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', width: 16 }}>{idx + 1}</Text>
                <Text style={{ fontSize: 16 }}>{CATEGORY_LABEL[r.category].split(' ')[0]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1e293b' }}>{r.name}</Text>
                  <StarRating rating={r.rating} />
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <PriceBadge range={r.priceRange} />
                  <Text style={{ fontSize: 10, color: '#64748b' }}>{formatTicket(r.averageTicket)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
