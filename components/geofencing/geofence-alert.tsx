import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBeaches } from '@/hooks/useBeaches';
import { useTraffic } from '@/hooks/useTraffic';
import { useReports } from '@/hooks/useReports';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { haversineDistance, formatDistance, occupancyColor, trafficLevelColor } from '@/lib/utils';
import { sendLocalNotification } from '@/lib/notifications';

interface GeoAlert {
  id: string;
  title: string;
  message: string;
  color: string;
  emoji: string;
  type: 'beach' | 'traffic' | 'report' | 'general';
}

export function GeofenceAlert() {
  const [alerts, setAlerts] = useState<GeoAlert[]>([]);
  const { city } = useCity();
  const { locale } = useLanguage();
  const { data: beaches } = useBeaches(city);
  const { data: traffic } = useTraffic(city);
  const { data: reports } = useReports(city);
  const { coords } = useGeolocation();
  const insets = useSafeAreaInsets();

  // Controla quais alertas de proximidade já foram disparados (reset ao sair da área)
  const shownRef = useRef<Set<string>>(new Set());
  const prevTrafficRef = useRef<typeof traffic>(undefined);

  // Alerta de boas-vindas no mount
  useEffect(() => {
    const welcome: GeoAlert = {
      id: 'welcome',
      title: 'Bem-vindo ao Litoral na Palma! 🌊',
      message: 'Alertas em tempo real ativados.',
      color: '#0077b6',
      emoji: '🔔',
      type: 'general',
    };
    setAlerts([welcome]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== 'welcome')), 5000);
  }, []);

  // Alertas baseados em distância real do usuário
  useEffect(() => {
    if (!coords) return;

    const newAlerts: GeoAlert[] = [];

    // Praia lotada a menos de 2km
    beaches?.forEach((beach) => {
      const dist = haversineDistance(coords.lat, coords.lng, beach.lat, beach.lng);
      const alertId = `beach-near-${beach.id}`;

      if (dist < 2 && beach.occupancy === 'lotada') {
        if (!shownRef.current.has(alertId)) {
          shownRef.current.add(alertId);
          newAlerts.push({
            id: alertId,
            title: 'Praia Lotada Próxima',
            message: `${beach.name} está lotada (${formatDistance(dist)}).`,
            color: occupancyColor('lotada'),
            emoji: '🏖️',
            type: 'beach',
          });
        }
      } else {
        // Usuário saiu da área — permite disparar novamente se voltar
        shownRef.current.delete(alertId);
      }
    });

    // Acidente reportado a menos de 5km
    reports
      ?.filter((r) => r.type === 'acidente')
      .forEach((report) => {
        const dist = haversineDistance(coords.lat, coords.lng, report.lat, report.lng);
        const alertId = `report-near-${report.id}`;

        if (dist < 5) {
          if (!shownRef.current.has(alertId)) {
            shownRef.current.add(alertId);
            newAlerts.push({
              id: alertId,
              title: 'Acidente Próximo',
              message: `Acidente a ${formatDistance(dist)} de você.`,
              color: '#ef4444',
              emoji: '🚨',
              type: 'report',
            });
          }
        } else {
          shownRef.current.delete(alertId);
        }
      });

    if (newAlerts.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 3));
      // Notificação local para cada alerta novo (só dispara se app não estiver em foreground)
      newAlerts.forEach((a) => {
        sendLocalNotification({ title: a.title, body: a.message, type: a.type, locale });
      });
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => !newAlerts.some((na) => na.id === a.id)));
      }, 8000);
    }
  }, [coords, beaches, reports]);

  // Fallback: alertas por degradação de tráfego (funciona com ou sem GPS)
  useEffect(() => {
    if (!traffic) return;
    const newAlerts: GeoAlert[] = [];

    if (prevTrafficRef.current) {
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
            type: 'traffic',
          });
        }
      });
    }
    prevTrafficRef.current = traffic;

    if (newAlerts.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 3));
      newAlerts.forEach((a) => {
        sendLocalNotification({ title: a.title, body: a.message, type: a.type, locale });
      });
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => !newAlerts.some((na) => na.id === a.id)));
      }, 6000);
    }
  }, [traffic]);

  if (alerts.length === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 72,
        right: 12,
        width: 280,
        zIndex: 100,
        gap: 8,
      }}
    >
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: `${alert.color}22`,
            boxShadow: `0 8px 28px ${alert.color}26`,
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
              backgroundColor: `${alert.color}18`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${alert.color}28`,
            }}
          >
            <Text style={{ fontSize: 16 }}>{alert.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: alert.color, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Litoral na Palma
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b', marginTop: 1 }}>{alert.title}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 15 }}>{alert.message}</Text>
          </View>
          <Pressable onPress={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}>
            <Text style={{ fontSize: 12, color: '#94a3b8', padding: 4 }}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
