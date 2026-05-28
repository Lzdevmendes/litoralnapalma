import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useBeaches } from '@/hooks/useBeaches';
import { useWaterQuality } from '@/hooks/useWaterQuality';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { occupancyColor } from '@/lib/utils';

import type { Beach } from '@/lib/types';

const waterColor: Record<Beach['waterQuality'], string> = {
  boa: '#22c55e',
  regular: '#f59e0b',
  impropia: '#ef4444',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function BeachCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: beaches, isLoading, isError, error, refetch } = useBeaches(city);
  const { data: waterQuality } = useWaterQuality();

  if (isLoading) return <CardSkeleton />;
  if (isError || !beaches) return <ErrorCard error={error} onRetry={refetch} />;

  // Mescla dados CETESB com os dados de praia
  const merged = beaches.map((b) => {
    const wq = waterQuality?.find((w) => w.beachId === b.id);
    return wq ? { ...b, waterQuality: wq.quality, collectedAt: wq.collectedAt } : b;
  });

  const free = merged.filter((b) => b.occupancy === 'vazia').length;
  const busy = merged.filter((b) => b.occupancy === 'lotada').length;
  const collectedAt = merged.find((b) => b.collectedAt)?.collectedAt;

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
            <Text style={{ fontSize: 18 }}>🏖️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{t.beach.label}</Text>
            {collectedAt && (
              <Text style={{ fontSize: 10, color: '#94a3b8' }}>
                CETESB · {formatDate(collectedAt)}
              </Text>
            )}
          </View>
        </View>
        <Text style={{ fontSize: 12, color: '#64748b' }}>
          <Text style={{ color: '#22c55e', fontWeight: '700' }}>{free}</Text> {t.beach.free} ·{' '}
          <Text style={{ color: '#ef4444', fontWeight: '700' }}>{busy}</Text> {t.beach.crowded}
        </Text>
      </View>

      {/* Lista de praias */}
      <View style={{ gap: 8 }}>
        {merged.map((beach) => {
          const color = occupancyColor(beach.occupancy);
          const wColor = waterColor[beach.waterQuality];
          return (
            <Pressable
              key={beach.id}
              onPress={() => router.push(`/praia/${beach.id}`)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(0,119,182,0.06)' : 'rgba(255,255,255,0.8)',
                borderRadius: 14,
                padding: 12,
                gap: 8,
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>{beach.name}</Text>
                <Badge color={color}>{t.beach.occupancy[beach.occupancy]}</Badge>
              </View>
              <ProgressBar value={beach.occupancyPercent} color={color} height={5} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontSize: 11, color: '#64748b' }}>👥 {beach.occupancyPercent}%</Text>
                <Text style={{ fontSize: 11, color: '#64748b' }}>🌊 {beach.wavesHeight.toFixed(1)}m</Text>
                <Text style={{ fontSize: 11, color: wColor, fontWeight: '600' }}>
                  💧 {t.beach.water[beach.waterQuality]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
