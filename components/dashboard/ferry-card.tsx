import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { MockBadge } from '@/components/ui/mock-badge';
import { useFerry } from '@/hooks/useFerry';
import { useLanguage } from '@/context/language-context';
import { timeAgo } from '@/lib/utils';

function waitColor(minutes: number): string {
  if (minutes < 30) return '#22c55e';
  if (minutes < 60) return '#f59e0b';
  if (minutes < 120) return '#f97316';
  return '#ef4444';
}

export function FerryCard() {
  const { locale, t } = useLanguage();
  const { data: ferry, isLoading, isError, error, refetch } = useFerry();

  if (isLoading) return <CardSkeleton />;
  if (isError || !ferry) return <ErrorCard error={error} onRetry={refetch} />;

  const carColor = waitColor(ferry.waitTimeCars);
  const motoColor = waitColor(ferry.waitTimeMotorcycles);

  function waitLabel(minutes: number): string {
    if (minutes === 0) return t.ferry.noQueue;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  return (
    <View
      style={{
        backgroundColor: '#f0f9ff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,119,182,0.15)',
        boxShadow: '0 2px 12px rgba(0,119,182,0.08)',
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
              backgroundColor: 'rgba(0,119,182,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>⛴️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.ferry.label}</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>São Sebastião ↔ Ilhabela</Text>
          </View>
        </View>
        <Badge color={ferry.isOperating ? '#22c55e' : '#ef4444'} dot>
          {ferry.isOperating ? t.ferry.operating : t.ferry.closed}
        </Badge>
      </View>

      {/* Tempos de espera */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Carros */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 14,
            padding: 12,
            gap: 4,
            borderWidth: 1,
            borderColor: `${carColor}22`,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🚗</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: carColor }}>
            {waitLabel(ferry.waitTimeCars)}
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {t.ferry.cars}
          </Text>
        </View>

        {/* Motos */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 14,
            padding: 12,
            gap: 4,
            borderWidth: 1,
            borderColor: `${motoColor}22`,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🏍️</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: motoColor }}>
            {waitLabel(ferry.waitTimeMotorcycles)}
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {t.ferry.motos}
          </Text>
        </View>

        {/* Próxima partida */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 14,
            padding: 12,
            gap: 4,
            borderWidth: 1,
            borderColor: 'rgba(0,119,182,0.12)',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🕐</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0077b6' }}>
            {ferry.nextDeparture}
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {t.ferry.nextDeparture}
          </Text>
        </View>
      </View>

      {/* Rodapé */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <MockBadge message="Status da balsa é estimado. API DER-SP em integração." />
        <Text style={{ fontSize: 10, color: '#94a3b8' }}>
          {t.ferry.updated} {timeAgo(ferry.lastUpdated, locale)}
        </Text>
      </View>
    </View>
  );
}
