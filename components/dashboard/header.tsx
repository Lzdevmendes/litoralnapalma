import { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { UserMode } from '@/lib/types';

interface HeaderProps {
  mode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

const BLUE = '#0077b6';

export function Header({ mode, onModeChange }: HeaderProps) {
  const queryClient = useQueryClient();
  const rotation = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  async function handleRefresh() {
    rotation.setValue(0);
    spinRef.current = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 800, useNativeDriver: true })
    );
    spinRef.current.start();
    await queryClient.invalidateQueries();
    spinRef.current?.stop();
    spinRef.current = null;
    rotation.setValue(0);
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,119,182,0.1)',
        gap: 12,
      }}
    >
      {/* Logo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: BLUE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>🧭</Text>
        </View>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: BLUE }}>Litoral na Palma</Text>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>📍 Caraguatatuba, SP</Text>
        </View>
      </View>

      {/* Mode toggle */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.06)',
          borderRadius: 12,
          padding: 3,
          gap: 2,
        }}
      >
        {(['morador', 'turista'] as UserMode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => onModeChange(m)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9,
              backgroundColor: mode === m ? BLUE : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: mode === m ? '#fff' : '#64748b',
              }}
            >
              {m === 'morador' ? '🏠 Morador' : '🧳 Turista'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Refresh */}
      <Pressable
        onPress={handleRefresh}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${BLUE}12`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.Text style={[{ fontSize: 16 }, { transform: [{ rotate: spin }] }]}>
          🔄
        </Animated.Text>
      </Pressable>
    </View>
  );
}
