import { View, Text, type ViewStyle } from 'react-native';

interface BadgeProps {
  children: string;
  color: string;
  dot?: boolean;
  style?: ViewStyle;
}

export function Badge({ children, color, dot, style }: BadgeProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 20,
          backgroundColor: `${color}18`,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      )}
      <Text style={{ fontSize: 11, fontWeight: '600', color }}>{children}</Text>
    </View>
  );
}
