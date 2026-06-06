import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Constants from 'expo-constants';
import { CITIES } from '@/data/cities';
import type { FuelType, GasStation } from '@/data/cities';
import { useLanguage } from '@/context/language-context';
import { mapsNavigationUrl } from '@/lib/utils';

// ── react-native-maps (só disponível em dev build) ───────────────────────────
const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as unknown as { appOwnership?: string }).appOwnership === 'expo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MapView: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Marker: any = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch {
    // módulo nativo não disponível
  }
}

// ── utils ────────────────────────────────────────────────────────────────────

const brandColor: Record<string, string> = {
  Ipiranga:  '#f97316',
  Shell:     '#f59e0b',
  BR:        '#22c55e',
  Petrobras: '#3b82f6',
};

const fuelIcon: Record<FuelType, string> = {
  gasolina: '🔴',
  etanol:   '🌿',
  diesel:   '⚫',
  gnv:      '💨',
};

const fuelLabel: Record<FuelType, string> = {
  gasolina: 'Gasolina Comum',
  etanol:   'Etanol Hidratado',
  diesel:   'Diesel S-10',
  gnv:      'GNV (m³)',
};

function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── componente ────────────────────────────────────────────────────────────────

export default function GasStationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();

  // Localiza cidade e posto pelo id
  const found = CITIES.reduce<{ city: (typeof CITIES)[0]; station: GasStation } | null>(
    (acc, city) => {
      if (acc) return acc;
      const s = city.gasStations.find((s) => s.id === id);
      return s ? { city, station: s } : null;
    },
    null
  );

  if (!found) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#fff9f0', alignItems: 'center', justifyContent: 'center', gap: 12 }}
      >
        <Text style={{ fontSize: 40 }}>🔍</Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.gas.notFound}</Text>
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f97316', borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t.nav.back}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { city, station } = found;
  const brandAccent = brandColor[station.brand] ?? '#6366f1';
  const mapsUrl = mapsNavigationUrl(station.lat, station.lng, station.name);

  // Todos os postos da cidade para a listagem completa
  const allStations = city.gasStations;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff9f0' }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff9f0',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.06)',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: pressed ? `${brandAccent}20` : `${brandAccent}14`,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 18, color: brandAccent }}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
            {station.name}
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>
            {station.brand} · {city.name}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: `${brandAccent}18`,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: brandAccent }}>{station.brand}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preços card */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: `${brandAccent}20`,
            boxShadow: `0 2px 12px ${brandAccent}14`,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t.gas.currentPrices}
          </Text>

          <View style={{ gap: 8 }}>
            {station.fuels.map((fuel) => (
              <View
                key={fuel.type}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  borderRadius: 14,
                  padding: 12,
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 20 }}>{fuelIcon[fuel.type]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e293b' }}>
                    {t.gas.fuelLabels[fuel.type]}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8' }}>
                    {t.gas.updatedOn} {formatDate(fuel.updatedAt)}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: brandAccent }}>
                  {formatPrice(fuel.price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Endereço */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t.gas.location}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>📍</Text>
            <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 }}>
              {station.address}
            </Text>
          </View>
        </View>

        {/* Como chegar */}
        <Pressable
          onPress={() => Linking.openURL(mapsUrl)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#d97706' : brandAccent,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 18 }}>🗺️</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{t.gas.directions}</Text>
        </Pressable>

        {/* Mini mapa */}
        {!isExpoGo && MapView && Marker ? (
          <View style={{ borderRadius: 20, overflow: 'hidden', height: 200, boxShadow: '0 2px 16px rgba(249,115,22,0.12)' }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: station.lat,
                longitude: station.lng,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: station.lat, longitude: station.lng }}
                title={station.name}
                description={station.address}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${brandAccent}30`,
                    borderWidth: 2.5,
                    borderColor: brandAccent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>⛽</Text>
                </View>
              </Marker>
            </MapView>
          </View>
        ) : (
          <View
            style={{
              height: 140,
              borderRadius: 20,
              backgroundColor: '#fef3ec',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: 'rgba(249,115,22,0.15)',
            }}
          >
            <Text style={{ fontSize: 32 }}>🗺️</Text>
            <Text style={{ fontSize: 12, color: '#f97316', fontWeight: '600' }}>{t.gas.mapDevBuild}</Text>
          </View>
        )}

        {/* Comparação com outros postos da cidade */}
        {allStations.length > 1 && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.gas.compareIn} {city.name}
            </Text>

            <View style={{ gap: 6 }}>
              {allStations
                .sort((a, b) => {
                  const pa = a.fuels.find((f) => f.type === 'gasolina')?.price ?? Infinity;
                  const pb = b.fuels.find((f) => f.type === 'gasolina')?.price ?? Infinity;
                  return pa - pb;
                })
                .map((s) => {
                  const gas = s.fuels.find((f) => f.type === 'gasolina');
                  const eth = s.fuels.find((f) => f.type === 'etanol');
                  const isThis = s.id === station.id;
                  const sColor = brandColor[s.brand] ?? '#6366f1';

                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => router.replace(`/posto/${s.id}`)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isThis
                          ? `${brandAccent}10`
                          : pressed
                          ? 'rgba(0,0,0,0.03)'
                          : 'transparent',
                        borderRadius: 12,
                        padding: 10,
                        borderWidth: isThis ? 1 : 0,
                        borderColor: `${brandAccent}30`,
                        gap: 8,
                      })}
                    >
                      <Text style={{ fontSize: 16 }}>⛽</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: isThis ? '700' : '600', color: '#1e293b' }}>
                          {s.name}
                        </Text>
                        {eth && (
                          <Text style={{ fontSize: 10, color: '#94a3b8' }}>
                            {t.gas.fuelLabels.etanol} {formatPrice(eth.price)}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        {gas && (
                          <Text style={{ fontSize: 13, fontWeight: '800', color: sColor }}>
                            {formatPrice(gas.price)}
                          </Text>
                        )}
                        <Text style={{ fontSize: 9, color: '#94a3b8' }}>{t.gas.fuelLabels.gasolina}</Text>
                      </View>
                    </Pressable>
                  );
                })}
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
