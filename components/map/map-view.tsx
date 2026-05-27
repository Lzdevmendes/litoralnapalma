import { useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';
import { useBeaches } from '@/hooks/useBeaches';
import { useUPA } from '@/hooks/useUPA';
import { useReports } from '@/hooks/useReports';
import { useCity } from '@/context/city-context';
import { occupancyColor } from '@/lib/utils';

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

const DELTA = { latitudeDelta: 0.1, longitudeDelta: 0.1 };

const statusColor = { normal: '#22c55e', alerta: '#f59e0b', critico: '#ef4444' } as const;
const reportEmoji: Record<string, string> = {
  lotacao_praia: '🏖️', acidente: '🚨', blitz: '🚔',
  falta_agua: '💧', falta_luz: '⚡', outro: '📍',
};

function MapPlaceholder() {
  return (
    <View
      style={{
        height: 320,
        borderRadius: 20,
        backgroundColor: '#e8f4f8',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,119,182,0.18)',
      }}
    >
      <Text style={{ fontSize: 44 }}>🗺️</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0077b6' }}>Mapa ao Vivo</Text>
      <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 }}>
        Disponível no app completo (dev build).{'\n'}No Expo Go apenas o preview é exibido.
      </Text>
    </View>
  );
}

export function AppMapView() {
  const { city } = useCity();
  const { data: beaches } = useBeaches(city);
  const { data: upas } = useUPA(city);
  const { data: reports } = useReports();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: city.lat, longitude: city.lng, ...DELTA },
        500
      );
    }
  }, [city]);

  if (isExpoGo || !MapView) {
    return <MapPlaceholder />;
  }

  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', height: 320, boxShadow: '0 2px 16px rgba(0,119,182,0.12)' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ latitude: city.lat, longitude: city.lng, ...DELTA }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {beaches?.map((beach) => (
          <Marker
            key={beach.id}
            coordinate={{ latitude: beach.lat, longitude: beach.lng }}
            title={beach.name}
            description={`${beach.occupancyPercent}% ocupada · Água ${beach.waterQuality}`}
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
        {[
          { color: '#22c55e', label: 'Vazia' },
          { color: '#f59e0b', label: 'Moderada' },
          { color: '#ef4444', label: 'Lotada' },
        ].map(({ color, label }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            <Text style={{ fontSize: 10, color: '#374151' }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
