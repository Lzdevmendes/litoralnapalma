import { View, Text, Pressable, Linking } from 'react-native';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { C, R } from '@/lib/design';
import type { UserMode } from '@/lib/types';

export function ModeContent({ mode }: { mode: UserMode }) {
  const { city } = useCity();
  const { t } = useLanguage();
  const { services } = city;

  if (mode !== 'morador') return null;

  const feira = services.feiraLivre[0];

  interface ServiceItem {
    emoji: string; label: string; sub: string; color: string; url: string;
  }

  const moradorItems: ServiceItem[] = [
    {
      emoji: '💊', label: t.modeContent.pharmacy, sub: t.modeContent.mapsOpen,
      color: C.success,
      url: `https://maps.google.com/?q=${encodeURIComponent(`farmácias de plantão ${city.name} SP`)}`,
    },
    {
      emoji: '🛒', label: t.modeContent.fair,
      sub: `${feira?.day ?? ''} ${feira?.hours ?? ''}`, color: C.warning,
      url: `https://maps.google.com/?q=${encodeURIComponent(`feira livre ${feira?.location ?? city.name} ${city.name} SP`)}`,
    },
    {
      emoji: '🍽️', label: t.modeContent.restaurants, sub: t.modeContent.mapsOpen,
      color: C.primary,
      url: `https://maps.google.com/?q=${encodeURIComponent(`restaurantes ${city.name} SP`)}`,
    },
  ];

  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: R.card,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      gap: 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{
          width: 4, height: 16, borderRadius: 2,
          backgroundColor: C.primary,
        }} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>{t.modeContent.residentTitle}</Text>
        <Text style={{ fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>{city.name}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {moradorItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => Linking.openURL(item.url)}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? `${item.color}14` : `${item.color}08`,
              borderRadius: 16,
              padding: 12,
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: `${item.color}18`,
            })}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 14,
              backgroundColor: `${item.color}14`,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
            </View>
            <Text style={{
              fontSize: 10, fontWeight: '700', color: C.textPrimary,
              textAlign: 'center', lineHeight: 14,
            }} numberOfLines={2}>
              {item.label}
            </Text>
            {item.sub ? (
              <Text style={{ fontSize: 9, color: item.color, textAlign: 'center' }}>
                {item.sub}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
