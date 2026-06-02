import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useFerry } from '@/hooks/useFerry';
import { useLanguage } from '@/context/language-context';
import { timeAgo } from '@/lib/utils';
import { C, R, CARD_BASE } from '@/lib/design';

function waitColor(minutes: number): string {
  if (minutes < 30) return C.success;
  if (minutes < 60) return C.warning;
  if (minutes < 120) return C.orange;
  return C.danger;
}

function waitLabel(minutes: number, t: { ferry: { noQueue: string } }): string {
  if (minutes === 0) return t.ferry.noQueue;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function FerryCard() {
  const { locale, t } = useLanguage();
  const { data: ferry, isLoading, isError, error, refetch } = useFerry();

  if (isLoading) return <CardSkeleton />;
  if (isError || !ferry) return <ErrorCard error={error} onRetry={refetch} />;

  const carColor  = waitColor(ferry.waitTimeCars);
  const motoColor = waitColor(ferry.waitTimeMotorcycles);
  const operatingColor = ferry.isOperating ? C.success : C.danger;

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
            <Text style={{ fontSize: 17 }}>⛴️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>{t.ferry.label}</Text>
            <Text style={{ fontSize: 10, color: C.textMuted }}>São Sebastião ↔ Ilhabela</Text>
          </View>
        </View>
        <Badge color={operatingColor} dot>
          {ferry.isOperating ? t.ferry.operating : t.ferry.closed}
        </Badge>
      </View>

      {/* Tempos em 3 colunas */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { emoji: '🚗', label: t.ferry.cars,         value: waitLabel(ferry.waitTimeCars, t),         color: carColor  },
          { emoji: '🏍️', label: t.ferry.motos,        value: waitLabel(ferry.waitTimeMotorcycles, t),  color: motoColor },
          { emoji: '🕐', label: t.ferry.nextDeparture, value: ferry.nextDeparture,                      color: C.primary },
        ].map(({ emoji, label, value, color }) => (
          <View
            key={label}
            style={{
              flex: 1,
              backgroundColor: C.surfaceAlt,
              borderRadius: 14,
              padding: 12,
              alignItems: 'center',
              gap: 4,
              borderTopWidth: 3,
              borderTopColor: color,
            }}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color }}>{value}</Text>
            <Text style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' }}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Rodapé */}
      <Text style={{ fontSize: 10, color: C.textMuted, textAlign: 'right' }}>
        {t.ferry.updated} {timeAgo(ferry.lastUpdated, locale)}
      </Text>
    </View>
  );
}
