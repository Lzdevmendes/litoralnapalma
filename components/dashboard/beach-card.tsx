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
import { C, R, CARD_BASE } from '@/lib/design';
import type { Beach } from '@/lib/types';

const WATER_COLOR: Record<Beach['waterQuality'], string> = {
  boa:      C.success,
  regular:  C.warning,
  impropia: C.danger,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function BeachCard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: beaches, isLoading, isError, error, refetch } = useBeaches(city);
  const { data: waterQuality } = useWaterQuality();

  if (isLoading) return <CardSkeleton />;
  if (isError || !beaches) return <ErrorCard error={error} onRetry={refetch} />;

  const merged = beaches.map((b) => {
    const wq = waterQuality?.find((w) => w.beachId === b.id);
    return wq ? { ...b, waterQuality: wq.quality, collectedAt: wq.collectedAt } : b;
  });

  const free = merged.filter((b) => b.occupancy === 'vazia').length;
  const busy = merged.filter((b) => b.occupancy === 'lotada').length;
  const cetesb = merged.find((b) => b.collectedAt)?.collectedAt;

  return (
    <View style={CARD_BASE}>
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 4, height: 14, borderRadius: 2, backgroundColor: C.primary }} />
          <View style={{
            width: 34, height: 34, borderRadius: R.icon,
            backgroundColor: C.primary12, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 17 }}>🏖️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>{t.beach.label}</Text>
            {cetesb && (
              <Text style={{ fontSize: 10, color: C.textMuted }}>CETESB · {formatDate(cetesb)}</Text>
            )}
          </View>
        </View>
        <Text style={{ fontSize: 12, color: C.textSecondary }}>
          <Text style={{ color: C.success, fontWeight: '700' }}>{free}</Text> {t.beach.free} ·{' '}
          <Text style={{ color: C.danger, fontWeight: '700' }}>{busy}</Text> {t.beach.crowded}
        </Text>
      </View>

      {/* Lista de praias */}
      <View style={{ gap: 8 }}>
        {merged.map((beach) => {
          const occColor = occupancyColor(beach.occupancy);
          const wColor = WATER_COLOR[beach.waterQuality];
          return (
            <Pressable
              key={beach.id}
              onPress={() => router.push(`/praia/${beach.id}`)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? C.primary08 : C.surfaceAlt,
                borderRadius: 14,
                padding: 12,
                gap: 7,
                borderWidth: 1,
                borderColor: pressed ? C.borderBlue : 'transparent',
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary }}>
                  {beach.name}
                </Text>
                <Badge color={occColor}>{t.beach.occupancy[beach.occupancy]}</Badge>
              </View>

              <ProgressBar value={beach.occupancyPercent} color={occColor} height={4} />

              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: C.textSecondary }}>
                  👥 {beach.occupancyPercent}%
                </Text>
                <Text style={{ fontSize: 11, color: C.textSecondary }}>
                  🌊 {beach.wavesHeight.toFixed(1)}m
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 3,
                  backgroundColor: `${wColor}14`, borderRadius: 6,
                  paddingHorizontal: 7, paddingVertical: 2,
                }}>
                  <Text style={{ fontSize: 10 }}>💧</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: wColor }}>
                    {t.beach.water[beach.waterQuality]}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
