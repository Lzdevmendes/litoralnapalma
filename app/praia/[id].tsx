import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Constants from 'expo-constants';
import { CITIES } from '@/data/cities';
import { useBeaches } from '@/hooks/useBeaches';
import { useWaterQuality } from '@/hooks/useWaterQuality';
import { useLanguage } from '@/context/language-context';
import { CardSkeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { occupancyColor, occupancyLabel, mapsNavigationUrl } from '@/lib/utils';
import type { Beach } from '@/lib/types';

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

function beachMiniMapHtml(lat: number, lng: number, name: string, color: string): string {
  const safeName = name.replace(/'/g, "\\'");
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%;background:#e8f4f8}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map=L.map('map',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false}).setView([${lat},${lng}],15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20}).addTo(map);
    L.circleMarker([${lat},${lng}],{radius:14,fillColor:'${color}',color:'#fff',weight:3,fillOpacity:0.9}).addTo(map).bindPopup('${safeName}').openPopup();
  <\/script>
</body>
</html>`;
}

const waterColor: Record<Beach['waterQuality'], string> = {
  boa: '#22c55e',
  regular: '#f59e0b',
  impropia: '#ef4444',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── componente ────────────────────────────────────────────────────────────────

export default function BeachDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();

  // Localiza cidade e praia estática pelo id
  const found = CITIES.reduce<{ city: (typeof CITIES)[0]; beachStatic: (typeof CITIES)[0]['beaches'][0] } | null>(
    (acc, city) => {
      if (acc) return acc;
      const b = city.beaches.find((b) => b.id === id);
      return b ? { city, beachStatic: b } : null;
    },
    null
  );

  const { data: beaches, isLoading } = useBeaches(found?.city);
  const { data: waterQuality } = useWaterQuality();

  // Mescla dados CETESB na praia atual (qualidade real + data da coleta)
  const beach = useMemo(() => {
    const raw = beaches?.find((b) => b.id === id);
    if (!raw || !waterQuality) return raw;
    const wq = waterQuality.find((w) => w.beachId === id);
    return wq ? { ...raw, waterQuality: wq.quality, collectedAt: wq.collectedAt } : raw;
  }, [beaches, waterQuality, id]);

  if (!found) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f6fc', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 40 }}>🔍</Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.beach.notFound}</Text>
        <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#0077b6', borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t.nav.back}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { city, beachStatic } = found;
  const mapsUrl = mapsNavigationUrl(beachStatic.lat, beachStatic.lng, beachStatic.name, city.name);

  const amenities = beachStatic.amenities;
  const amenityItems = [
    { label: t.beach.amenities.banheiros, icon: '🚿', ok: amenities.banheiros },
    { label: t.beach.amenities.quiosques, icon: '🏖️', ok: amenities.quiosques },
    { label: t.beach.amenities.estacionamento, icon: '🅿️', ok: amenities.estacionamento },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f6fc' }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#f0f6fc',
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
            backgroundColor: pressed ? 'rgba(0,119,182,0.12)' : 'rgba(0,119,182,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 18, color: '#0077b6' }}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
            {beachStatic.name}
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>{city.name} · {city.state}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ocupação & qualidade */}
        {isLoading ? (
          <CardSkeleton />
        ) : beach ? (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(0,119,182,0.1)',
              boxShadow: '0 2px 12px rgba(0,119,182,0.08)',
              gap: 12,
            }}
          >
            {/* Hero */}
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 52 }}>🏖️</Text>
              <Badge color={occupancyColor(beach.occupancy)} dot>
                {occupancyLabel(beach.occupancy)}
              </Badge>
            </View>

            {/* Barra de ocupação */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#64748b' }}>{t.beach.occupation}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: occupancyColor(beach.occupancy) }}>
                  {beach.occupancyPercent}%
                </Text>
              </View>
              <ProgressBar value={beach.occupancyPercent} color={occupancyColor(beach.occupancy)} height={8} />
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                {
                  emoji: '💧',
                  label: t.map.waterLabel,
                  value: t.beach.water[beach.waterQuality],
                  color: waterColor[beach.waterQuality],
                },
                {
                  emoji: '🌊',
                  label: 'Ondas', // nome técnico — não traduzir
                  value: `${beach.wavesHeight.toFixed(1)} m`,
                  color: '#0077b6',
                },
                ...(beach.collectedAt
                  ? [{ emoji: '📅', label: 'CETESB', value: formatDate(beach.collectedAt), color: '#64748b' }]
                  : []),
              ].map(({ emoji, label, value, color }) => (
                <View
                  key={label}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    borderRadius: 14,
                    padding: 10,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{emoji}</Text>
                  <Text style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color }}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Estrutura */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t.beach.infrastructure}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {amenityItems.map(({ label, icon, ok }) => (
              <View
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: ok ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 14,
                  padding: 10,
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 1,
                  borderColor: ok ? 'rgba(34,197,94,0.2)' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: ok ? '#16a34a' : '#94a3b8', textAlign: 'center' }}>
                  {label}
                </Text>
                <Text style={{ fontSize: 9, color: ok ? '#16a34a' : '#94a3b8' }}>
                  {ok ? t.beach.available : t.beach.unavailable}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Como chegar */}
        <Pressable
          onPress={() => Linking.openURL(mapsUrl)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#005f92' : '#0077b6',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 18 }}>📍</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{t.beach.directions}</Text>
        </Pressable>

        {/* Mini mapa */}
        {!isExpoGo && MapView && Marker ? (
          <View style={{ borderRadius: 20, overflow: 'hidden', height: 200, boxShadow: '0 2px 16px rgba(0,119,182,0.12)' }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: beachStatic.lat,
                longitude: beachStatic.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: beachStatic.lat, longitude: beachStatic.lng }}
                title={beachStatic.name}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${occupancyColor(beach?.occupancy ?? 'vazia')}30`,
                    borderWidth: 2.5,
                    borderColor: occupancyColor(beach?.occupancy ?? 'vazia'),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🏖️</Text>
                </View>
              </Marker>
            </MapView>
          </View>
        ) : (
          // Expo Go: mini-mapa Leaflet via WebView (sem react-native-maps)
          <View style={{ borderRadius: 20, overflow: 'hidden', height: 200, boxShadow: '0 2px 16px rgba(0,119,182,0.12)' }}>
            <WebView
              source={{
                html: beachMiniMapHtml(
                  beachStatic.lat,
                  beachStatic.lng,
                  beachStatic.name,
                  occupancyColor(beach?.occupancy ?? 'vazia'),
                ),
                baseUrl: 'https://unpkg.com',
              }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              allowFileAccess
              allowUniversalAccessFromFileURLs
            />
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
