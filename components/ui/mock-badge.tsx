import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

interface MockBadgeProps {
  message?: string;
}

export function MockBadge({ message = 'Dados simulados — fonte real em breve' }: MockBadgeProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setShowTip((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          alignSelf: 'flex-start',
          backgroundColor: '#fef9ec',
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderWidth: 1,
          borderColor: '#fde68a',
        }}
      >
        <Text style={{ fontSize: 10 }}>⚠️</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#92400e' }}>Dados simulados</Text>
      </Pressable>
      {showTip && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: '#fffbeb',
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: '#fde68a',
          }}
        >
          <Text style={{ fontSize: 11, color: '#78350f', lineHeight: 16 }}>{message}</Text>
        </View>
      )}
    </View>
  );
}
