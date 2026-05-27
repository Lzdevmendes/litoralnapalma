import { View, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useBeaches } from '@/hooks/useBeaches';
import { useUPA } from '@/hooks/useUPA';
import { useReports } from '@/hooks/useReports';
import { occupancyColor } from '@/lib/utils';

const CENTER = { latitude: -23.62, longitude: -45.41, latitudeDelta: 0.1, longitudeDelta: 0.1 };

const statusColor = { normal: '#22c55e', alerta: '#f59e0b', critico: '#ef4444' } as const;
const reportEmoji: Record<string, string> = {
  lotacao_praia: '🏖️', acidente: '🚨', blitz: '🚔',
  falta_agua: '💧', falta_luz: '⚡', outro: '📍',
};

export function AppMapView() {
  const { data: beaches } = useBeaches();
  const { data: upas } = useUPA();
  const { data: reports } = useReports();

  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', height: 320, boxShadow: '0 2px 16px rgba(0,119,182,0.12)' }}>
      <MapView style={{ flex: 1 }} initialRegion={CENTER} showsUserLocation showsMyLocationButton={false}>
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
