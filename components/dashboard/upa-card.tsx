import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useUPA } from '@/hooks/useUPA';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { formatWaitTime } from '@/lib/utils';

const statusEmoji: Record<'normal' | 'alerta' | 'critico', string> = {
  normal: '🟢',
  alerta: '🟡',
  critico: '🔴',
};

const statusColor: Record<'normal' | 'alerta' | 'critico', string> = {
  normal: '#22c55e',
  alerta: '#f59e0b',
  critico: '#ef4444',
};

export function UPACard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: upas, isLoading, isError, error, refetch } = useUPA(city);

  if (isLoading) return <CardSkeleton />;
  if (isError || !upas) return <ErrorCard error={error} onRetry={refetch} />;

  if (upas.length === 0) {
    return (
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#fef2f2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🏥</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>{t.upa.label}</Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 18 }}>
            Sem UPA local. Referência: UPA São Sebastião (balsa + 30 min)
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#fef2f2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>🏥</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.upa.label}</Text>
      </View>

      <View style={{ gap: 8 }}>
        {upas.map((upa) => {
          const emoji = statusEmoji[upa.status];
          const color = statusColor[upa.status];
          const label = t.upa.status[upa.status];
          return (
            <View
              key={upa.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.03)',
                borderRadius: 14,
                padding: 12,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{upa.name}</Text>
                  <Badge color={color}>{label}</Badge>
                </View>
                <Text style={{ fontSize: 12, color: '#64748b' }} selectable>
                  {upa.address}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>
                    ⏳ {t.upa.wait}:{' '}
                    <Text style={{ color, fontWeight: '700' }}>{formatWaitTime(upa.waitTime)}</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>👤 {upa.patientsWaiting} {t.upa.waiting}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
