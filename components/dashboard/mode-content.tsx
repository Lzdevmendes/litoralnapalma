import { View, Text, Pressable } from 'react-native';
import type { UserMode } from '@/lib/types';

interface ServiceItem {
  emoji: string;
  label: string;
  sub: string;
  color: string;
}

const moradorItems: ServiceItem[] = [
  { emoji: '💊', label: 'Farmácias de Plantão', sub: '3 abertas agora', color: '#22c55e' },
  { emoji: '🛒', label: 'Feira Livre', sub: 'Sáb • Centro • 6h–12h', color: '#f59e0b' },
  { emoji: '🍽️', label: 'Restaurantes Locais', sub: 'Desconto morador', color: '#0077b6' },
];

const turistaItems: ServiceItem[] = [
  { emoji: '🥾', label: 'Trilhas & Natureza', sub: '7 opções disponíveis', color: '#059669' },
  { emoji: '⚓', label: 'Passeios de Barco', sub: 'Saídas às 8h e 14h', color: '#0077b6' },
  { emoji: '🌿', label: 'Ecoturismo', sub: 'Serra do Mar · Mata Atlântica', color: '#16a34a' },
];

export function ModeContent({ mode }: { mode: UserMode }) {
  const items = mode === 'morador' ? moradorItems : turistaItems;
  const title = mode === 'morador' ? 'Serviços do Morador' : 'Para o Turista';
  const subtitle = mode === 'morador' ? 'Recursos essenciais da cidade' : 'Experiências únicas no Litoral Norte';

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
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.04)',
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
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
              {item.label}
            </Text>
            <Text style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
