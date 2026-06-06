import { View, Text, Pressable, Linking } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useUPA } from '@/hooks/useUPA';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { formatWaitTime, mapsNavigationUrl } from '@/lib/utils';
import { C, R, CARD_BASE } from '@/lib/design';

const STATUS_COLOR = {
  normal:  C.success,
  alerta:  C.warning,
  critico: C.danger,
} as const;

const STATUS_EMOJI = { normal: '🟢', alerta: '🟡', critico: '🔴' } as const;

export function UPACard() {
  const { city } = useCity();
  const { t } = useLanguage();
  const { data: upas, isLoading, isError, error, refetch } = useUPA(city);

  if (isLoading) return <CardSkeleton />;
  if (isError || !upas) return <ErrorCard error={error} onRetry={refetch} />;

  if (upas.length === 0) {
    return (
      <View style={CARD_BASE}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 4, height: 14, borderRadius: 2, backgroundColor: C.danger }} />
          <View style={{
            width: 34, height: 34, borderRadius: R.icon,
            backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 17 }}>🏥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>{t.upa.label}</Text>
            <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
              {city.name === 'Ilhabela' ? t.upa.ilhabelaNote : t.upa.noUpa}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={CARD_BASE}>
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 4, height: 14, borderRadius: 2, backgroundColor: C.danger }} />
        <View style={{
          width: 34, height: 34, borderRadius: R.icon,
          backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 17 }}>🏥</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>{t.upa.label}</Text>
      </View>

      {/* Lista de UPAs */}
      <View style={{ gap: 8 }}>
        {upas.map((upa) => {
          const color = STATUS_COLOR[upa.status];
          return (
            <View
              key={upa.id}
              style={{
                backgroundColor: C.surfaceAlt,
                borderRadius: 14,
                padding: 12,
                gap: 8,
                borderLeftWidth: 3,
                borderLeftColor: color,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, flex: 1 }}>
                  {STATUS_EMOJI[upa.status]} {upa.name}
                </Text>
                <Badge color={color}>{t.upa.status[upa.status]}</Badge>
              </View>

              <Text style={{ fontSize: 11, color: C.textMuted }} selectable>
                {upa.address}
              </Text>

              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: C.textSecondary }}>⏳ {t.upa.wait}:</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color }}>{formatWaitTime(upa.waitTime)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: C.textSecondary }}>👤</Text>
                  <Text style={{ fontSize: 12, color: C.textSecondary }}>
                    {upa.patientsWaiting} {t.upa.waiting}
                  </Text>
                </View>
                {upa.hours && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 11, color: C.textSecondary }}>🕐 {upa.hours}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => Linking.openURL(mapsNavigationUrl(upa.lat, upa.lng, upa.name))}
                  style={({ pressed }) => ({
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    gap: 4, paddingVertical: 8, borderRadius: 10,
                    backgroundColor: pressed ? `${color}22` : `${color}14`,
                  })}
                >
                  <Text style={{ fontSize: 12 }}>📍</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color }}>{t.upa.directions}</Text>
                </Pressable>
                {upa.phone && (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${upa.phone}`)}
                    style={({ pressed }) => ({
                      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                      gap: 4, paddingVertical: 8, borderRadius: 10,
                      backgroundColor: pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)',
                    })}
                  >
                    <Text style={{ fontSize: 12 }}>📞</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary }}>{upa.phone}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
