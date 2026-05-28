import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useGasStations } from '@/hooks/useGasStations';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import type { GasStation } from '@/data/cities';

const brandColor: Record<string, string> = {
  Ipiranga: '#f97316',
  Shell:    '#f59e0b',
  BR:       '#22c55e',
  Petrobras:'#3b82f6',
};

function cheapestGasolina(station: GasStation): number {
  return station.fuels.find((f) => f.type === 'gasolina')?.price ?? Infinity;
}

function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function GasCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: stations, isLoading, isError, error, refetch } = useGasStations(city);

  if (isLoading) return <CardSkeleton />;
  if (isError || !stations) return <ErrorCard error={error} onRetry={refetch} />;

  // Top 3 mais baratos em gasolina
  const sorted = [...stations].sort((a, b) => cheapestGasolina(a) - cheapestGasolina(b));
  const top3 = sorted.slice(0, 3);

  const cheapest = top3[0];
  const cheapestPrice = cheapestGasolina(cheapest);

  return (
    <View
      style={{
        backgroundColor: '#fff9f0',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.15)',
        boxShadow: '0 2px 12px rgba(249,115,22,0.08)',
        gap: 12,
      }}
    >
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(249,115,22,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>⛽</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.sections.gas}</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>{stations.length} {t.gas.stations} · {city.name}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>{t.gas.cheapest}</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#f97316' }}>
            {formatPrice(cheapestPrice)}
          </Text>
          <Text style={{ fontSize: 9, color: '#94a3b8' }}>{t.gas.gasUnit}</Text>
        </View>
      </View>

      {/* Lista top 3 */}
      <View style={{ gap: 8 }}>
        {top3.map((station, idx) => {
          const gas = station.fuels.find((f) => f.type === 'gasolina');
          const eth = station.fuels.find((f) => f.type === 'etanol');
          const color = brandColor[station.brand] ?? '#6366f1';
          const isCheapest = idx === 0;

          return (
            <Pressable
              key={station.id}
              onPress={() => router.push(`/posto/${station.id}`)}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? 'rgba(249,115,22,0.08)'
                  : isCheapest
                  ? 'rgba(249,115,22,0.06)'
                  : 'rgba(255,255,255,0.8)',
                borderRadius: 14,
                padding: 12,
                borderWidth: isCheapest ? 1 : 0,
                borderColor: 'rgba(249,115,22,0.25)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              })}
            >
              {/* Rank badge */}
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  backgroundColor: isCheapest ? '#f97316' : 'rgba(0,0,0,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: isCheapest ? '#fff' : '#94a3b8' }}>
                  {idx + 1}
                </Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
                    {station.name}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 6,
                      backgroundColor: `${color}20`,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '700', color }}>{station.brand}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, color: '#94a3b8' }} numberOfLines={1}>
                  {station.address}
                </Text>
              </View>

              {/* Preços */}
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                {gas && (
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#f97316' }}>
                    {formatPrice(gas.price)}
                  </Text>
                )}
                {eth && (
                  <Text style={{ fontSize: 10, color: '#64748b' }}>
                    {t.gas.fuelLabels.etanol} {formatPrice(eth.price)}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Ver todos */}
      {stations.length > 3 && (
        <Pressable
          onPress={() => router.push(`/posto/${stations[0].id}`)}
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 12, color: '#f97316', fontWeight: '600' }}>
            {t.gas.viewAll} {stations.length} {t.gas.stations} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}
