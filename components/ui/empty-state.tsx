import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ emoji, title, subtitle, action }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 28,
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 40, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 }}>
          {subtitle}
        </Text>
      ) : null}
      {action ? (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => ({
            marginTop: 8,
            backgroundColor: pressed ? '#005f92' : '#0077b6',
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 10,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
