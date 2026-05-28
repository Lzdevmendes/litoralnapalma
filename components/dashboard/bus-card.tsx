import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useBusLines } from '@/hooks/useBusLines';
import { useCity } from '@/context/city-context';
import type { BusLineWithTimes } from '@/hooks/useBusLines';

type Filter = 'todos' | 'municipal' | 'intermunicipal';

function NextDepartureChip({ line }: { line: BusLineWithTimes }) {
  if (line.nextDepartureIn === null) {
    return (
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(100,116,139,0.12)' }}>
        <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600' }}>Encerrado</Text>
      </View>
    );
  }
  if (line.nextDepartureIn <= 5) {
    return (
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.12)' }}>
        <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: '700' }}>
          em {line.nextDepartureIn} min
        </Text>
      </View>
    );
  }
  if (line.nextDepartureIn <= 15) {
    return (
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.12)' }}>
        <Text style={{ fontSize: 10, color: '#d97706', fontWeight: '700' }}>
          em {line.nextDepartureIn} min
        </Text>
      </View>
    );
  }
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(34,197,94,0.12)' }}>
      <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '700' }}>
        {line.nextDepartureTime}
      </Text>
    </View>
  );
}

function RouteStops({ route }: { route: string[] }) {
  return (
    <View style={{ gap: 4, paddingTop: 8, paddingLeft: 4 }}>
      {route.map((stop, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === 0 || idx === route.length - 1 ? '#6366f1' : '#cbd5e1',
              borderWidth: idx === 0 || idx === route.length - 1 ? 0 : 1,
              borderColor: '#94a3b8',
            }}
          />
          {idx < route.length - 1 && (
            <View
              style={{
                position: 'absolute',
                left: 3.5,
                top: 10,
                width: 1,
                height: 14,
                backgroundColor: '#e2e8f0',
              }}
            />
          )}
          <Text style={{ fontSize: 11, color: idx === 0 || idx === route.length - 1 ? '#374151' : '#64748b', fontWeight: idx === 0 || idx === route.length - 1 ? '600' : '400' }}>
            {stop}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function BusCard() {
  const { city } = useCity();
  const { data: lines, isLoading, isError, error, refetch } = useBusLines(city);
  const [filter, setFilter] = useState<Filter>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <CardSkeleton />;
  if (isError || !lines) return <ErrorCard error={error} onRetry={refetch} />;

  const filtered = filter === 'todos' ? lines : lines.filter((l) => l.type === filter);
  const activeCount = lines.filter((l) => l.nextDepartureIn !== null).length;

  const filters: { key: Filter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'municipal', label: 'Municipal' },
    { key: 'intermunicipal', label: 'Intermunicipal' },
  ];

  return (
    <View
      style={{
        backgroundColor: '#f0f4ff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.15)',
        boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
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
              backgroundColor: 'rgba(99,102,241,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>🚌</Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>Ônibus</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>{activeCount} linhas em operação</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#6366f1', fontWeight: '600' }}>
          {lines.length} linhas
        </Text>
      </View>

      {/* Filtros */}
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {filters.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              backgroundColor: filter === key ? '#6366f1' : 'rgba(99,102,241,0.08)',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: filter === key ? '#fff' : '#6366f1' }}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Lista */}
      <View style={{ gap: 8 }}>
        {filtered.map((line) => {
          const isExpanded = expandedId === line.id;
          const isIntermunicipal = line.type === 'intermunicipal';

          return (
            <Pressable
              key={line.id}
              onPress={() => setExpandedId(isExpanded ? null : line.id)}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? 'rgba(99,102,241,0.08)'
                  : isExpanded
                  ? 'rgba(99,102,241,0.06)'
                  : 'rgba(255,255,255,0.85)',
                borderRadius: 14,
                padding: 12,
                borderWidth: isExpanded ? 1 : 0,
                borderColor: 'rgba(99,102,241,0.2)',
                gap: 6,
              })}
            >
              {/* Linha superior */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Número */}
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: isIntermunicipal ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
                    minWidth: 36,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: isIntermunicipal ? '#6366f1' : '#16a34a' }}>
                    {line.number}
                  </Text>
                </View>

                {/* Nome e empresa */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>
                    {line.name}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8' }}>{line.company}</Text>
                </View>

                {/* Próxima partida */}
                <NextDepartureChip line={line} />

                {/* Expand arrow */}
                <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 2 }}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </View>

              {/* Linha de info adicional */}
              <View style={{ flexDirection: 'row', gap: 12, paddingLeft: 44 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={{ fontSize: 10 }}>🏁</Text>
                  <Text style={{ fontSize: 10, color: '#64748b' }}>
                    {line.lastDepartureFromGarage
                      ? `Última: ${line.lastDepartureFromGarage}`
                      : `Inicia: ${line.firstDeparture}`}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={{ fontSize: 10 }}>🔁</Text>
                  <Text style={{ fontSize: 10, color: '#64748b' }}>a cada {line.frequency} min</Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    borderRadius: 6,
                    backgroundColor: isIntermunicipal ? 'rgba(99,102,241,0.1)' : 'rgba(34,197,94,0.1)',
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '700', color: isIntermunicipal ? '#6366f1' : '#16a34a' }}>
                    {isIntermunicipal ? 'Intermunicipal' : 'Municipal'}
                  </Text>
                </View>
              </View>

              {/* Percurso expandido */}
              {isExpanded && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(99,102,241,0.12)',
                    paddingTop: 10,
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Percurso
                  </Text>
                  <RouteStops route={line.route} />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.06)', borderRadius: 10, padding: 8, gap: 1 }}>
                      <Text style={{ fontSize: 9, color: '#94a3b8' }}>1ª partida</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366f1' }}>{line.firstDeparture}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.06)', borderRadius: 10, padding: 8, gap: 1 }}>
                      <Text style={{ fontSize: 9, color: '#94a3b8' }}>Última partida</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366f1' }}>{line.lastDeparture}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.06)', borderRadius: 10, padding: 8, gap: 1 }}>
                      <Text style={{ fontSize: 9, color: '#94a3b8' }}>Frequência</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366f1' }}>{line.frequency} min</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 2 }}>
                    <Text style={{ fontSize: 11 }}>🏠</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', flex: 1 }}>{line.garageAddress}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 20, gap: 6 }}>
            <Text style={{ fontSize: 28 }}>🚏</Text>
            <Text style={{ fontSize: 13, color: '#94a3b8' }}>Nenhuma linha nesta categoria</Text>
          </View>
        )}
      </View>
    </View>
  );
}
