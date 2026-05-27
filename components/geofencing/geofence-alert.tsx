import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useBeaches } from '@/hooks/useBeaches';
import { useTraffic } from '@/hooks/useTraffic';
import { occupancyColor, trafficLevelColor } from '@/lib/utils';

interface GeoAlert {
  id: string;
  title: string;
  message: string;
  color: string;
  emoji: string;
}

export function GeofenceAlert() {
  const [alerts, setAlerts] = useState<GeoAlert[]>([]);
  const { data: beaches } = useBeaches();
  const { data: traffic } = useTraffic();
  const prevBeachesRef = useRef<typeof beaches>(undefined);
  const prevTrafficRef = useRef<typeof traffic>(undefined);

  // Welcome alert on mount
  useEffect(() => {
    const demo: GeoAlert = {
      id: 'welcome',
      title: 'Bem-vindo ao Litoral na Palma! 🌊',
      message: 'Alertas em tempo real ativados.',
      color: '#0077b6',
      emoji: '🔔',
    };
    setAlerts([demo]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== 'welcome')), 5000);
  }, []);

  useEffect(() => {
    const newAlerts: GeoAlert[] = [];

    if (beaches && prevBeachesRef.current) {
      beaches.forEach((beach) => {
        const prev = prevBeachesRef.current?.find((b) => b.id === beach.id);
        if (prev && prev.occupancy !== 'lotada' && beach.occupancy === 'lotada') {
          newAlerts.push({
            id: `beach-${beach.id}-${Date.now()}`,
            title: 'Praia Lotada!',
            message: `${beach.name} atingiu capacidade máxima.`,
            color: occupancyColor('lotada'),
            emoji: '🏖️',
          });
        }
      });
    }
    prevBeachesRef.current = beaches;

    if (traffic && prevTrafficRef.current) {
      const order = { livre: 0, moderado: 1, lento: 2, parado: 3 } as const;
      traffic.forEach((route) => {
        const prev = prevTrafficRef.current?.find((r) => r.id === route.id);
        if (prev && order[route.level] > order[prev.level] && order[route.level] >= 2) {
          newAlerts.push({
            id: `traffic-${route.id}-${Date.now()}`,
            title: 'Trânsito Intenso',
            message: `${route.shortName} com tráfego ${route.level}.`,
            color: trafficLevelColor(route.level),
            emoji: '🚗',
          });
        }
      });
    }
    prevTrafficRef.current = traffic;

    if (newAlerts.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 3));
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => !newAlerts.some((na) => na.id === a.id)));
      }, 6000);
    }
  }, [beaches, traffic]);

  if (alerts.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 100,
        right: 12,
        zIndex: 100,
        gap: 8,
        maxWidth: 280,
      }}
    >
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderLeftWidth: 3,
            borderLeftColor: alert.color,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: `${alert.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>{alert.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b' }}>{alert.title}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{alert.message}</Text>
          </View>
          <Pressable onPress={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}>
            <Text style={{ fontSize: 12, color: '#94a3b8', padding: 4 }}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
