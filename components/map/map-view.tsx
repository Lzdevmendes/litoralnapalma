import { useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
// Text is used inside Marker children
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useBeaches } from '@/hooks/useBeaches';
import { useUPA } from '@/hooks/useUPA';
import { useReports } from '@/hooks/useReports';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { occupancyColor } from '@/lib/utils';
import { WebViewMap } from '@/components/map/webview-map';
// app.json deve ter react-native-maps no plugin e GOOGLE_MAPS_API_KEY para dev build

// react-native-maps requer dev build — não está disponível no Expo Go.
// Usar require() condicional + try-catch evita o crash do TurboModule na inicialização.
const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  // fallback para versões antigas de expo-constants
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
    // módulo nativo não disponível nesse ambiente
  }
}

/** Converte o zoom do city para latitudeDelta/longitudeDelta do MapView. */
function zoomToDelta(zoom: number) {
  const delta = 360 / Math.pow(2, zoom);
  return { latitudeDelta: delta, longitudeDelta: delta };
}

const statusColor = { normal: '#22c55e', alerta: '#f59e0b', critico: '#ef4444' } as const;
const reportEmoji: Record<string, string> = {
  lotacao_praia: '🏖️', acidente: '🚨', blitz: '🚔',
  falta_agua: '💧', falta_luz: '⚡', outro: '📍',
};


export function AppMapView() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: beaches } = useBeaches(city);
  const { data: upas } = useUPA(city);
  const { data: reports } = useReports(city);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  // Navega para a cidade selecionada com zoom correto ao trocar cidade.
  // Em react-native-maps, marcadores são JSX declarativos — atualizam
  // automaticamente a cada re-render (sem gestão imperativa de layers necessária).
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: city.center.lat,
          longitude: city.center.lng,
          ...zoomToDelta(city.zoom),
        },
        500
      );
    }
  }, [city]);

  if (isExpoGo || !MapView) {
    return (
      <WebViewMap
        city={city}
        beaches={beaches ?? []}
        upas={upas ?? []}
        reports={reports ?? []}
      />
    );
  }

  const delta = zoomToDelta(city.zoom);

  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', height: 320, boxShadow: '0 2px 16px rgba(0,119,182,0.12)' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ latitude: city.center.lat, longitude: city.center.lng, ...delta }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {beaches?.map((beach) => (
          <Marker
            key={beach.id}
            coordinate={{ latitude: beach.lat, longitude: beach.lng }}
            title={beach.name}
            description={`${beach.occupancyPercent}% ocupada · Água ${beach.waterQuality}`}
            onPress={() => router.push(`/praia/${beach.id}`)}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: `${occupancyColor(beach.occupancy)}30`,
                borderWidth: 2.5,
                borderColor: occupancyColor(beach.occupancy),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>🏖️</Text>
            </View>
          </Marker>
        ))}

        {upas?.map((upa) => (
          <Marker
            key={upa.id}
            coordinate={{ latitude: upa.lat, longitude: upa.lng }}
            title={upa.name}
            description={`Espera: ${upa.waitTime} min · ${upa.patientsWaiting} aguardando`}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${statusColor[upa.status]}20`,
                borderWidth: 2.5,
                borderColor: statusColor[upa.status],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>🏥</Text>
            </View>
          </Marker>
        ))}

        {reports?.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.lat, longitude: report.lng }}
            title="Reporte da comunidade"
            description={`${report.description ?? report.type} · 👍 ${report.upvotes}`}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(239,68,68,0.15)',
                borderWidth: 2,
                borderColor: '#ef4444',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 14 }}>{reportEmoji[report.type] ?? '📍'}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Legend */}
      <View
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 8,
          gap: 4,
        }}
      >
        {([
          { color: '#22c55e', label: t.beach.occupancy.vazia },
          { color: '#f59e0b', label: t.beach.occupancy.moderada },
          { color: '#ef4444', label: t.beach.occupancy.lotada },
        ] as const).map(({ color, label }) => (
          <View key={color} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <Text style={{ fontSize: 10, color: '#374151' }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
