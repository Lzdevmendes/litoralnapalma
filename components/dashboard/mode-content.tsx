import { View, Text, Pressable, Linking } from 'react-native';
import { useCity } from '@/context/city-context';
import type { UserMode } from '@/lib/types';

interface ServiceItem {
  emoji: string;
  label: string;
  sub: string;
  color: string;
  url?: string;
}

export function ModeContent({ mode }: { mode: UserMode }) {
  const { city } = useCity();
  const { services } = city;

  const feira = services.feiraLivre[0];
  const passeio = services.passeiosBarco[0];

  const moradorItems: ServiceItem[] = [
    {
      emoji: '💊',
      label: 'Farmácias de Plantão',
      sub: 'Abrir no Maps',
      color: '#22c55e',
      url: `https://maps.google.com/?q=${encodeURIComponent(`farmácias de plantão ${city.name} SP`)}`,
    },
    {
      emoji: '🛒',
      label: 'Feira Livre',
      sub: `${feira.day}, ${feira.hours}`,
      color: '#f59e0b',
    },
    {
      emoji: '🍽️',
      label: 'Restaurantes',
      sub: 'Abrir no Maps',
      color: '#0077b6',
      url: `https://maps.google.com/?q=${encodeURIComponent(`restaurantes ${city.name} SP`)}`,
    },
  ];

  const turistaItems: ServiceItem[] = [
    {
      emoji: '🥾',
      label: 'Trilhas & Natureza',
      sub: `${services.trilhasCount} disponíveis`,
      color: '#059669',
    },
    {
      emoji: '⚓',
      label: 'Passeios de Barco',
      sub: passeio?.name ?? 'Consulte operadoras',
      color: '#0077b6',
    },
    services.temBalsa
      ? {
          emoji: '⛴️',
          label: 'Balsa',
          sub: 'SS ↔ Ilhabela',
          color: '#7c3aed',
        }
      : {
          emoji: '🌿',
          label: 'Ecoturismo',
          sub: 'Mata Atlântica',
          color: '#16a34a',
        },
  ];

  const items = mode === 'morador' ? moradorItems : turistaItems;
  const title = mode === 'morador' ? 'Serviços do Morador' : 'Para o Turista';
  const subtitle =
    mode === 'morador'
      ? `Recursos de ${city.name}`
      : `Experiências em ${city.name}`;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        gap: 12,
      }}
    >
      <View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.url ? () => Linking.openURL(item.url!) : undefined}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: item.url ? `${item.color}12` : 'rgba(0,0,0,0.04)',
              borderRadius: 14,
              padding: 10,
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${item.color}18`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
            </View>
            <Text
              style={{ fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center' }}
              numberOfLines={2}
            >
              {item.label}
            </Text>
            <Text style={{ fontSize: 9, color: item.url ? item.color : '#94a3b8', textAlign: 'center' }}>
              {item.sub}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
