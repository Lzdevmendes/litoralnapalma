import { View, Pressable, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  hover?: boolean;
}

export function GlassCard({ children, style, onPress, hover = true }: GlassCardProps) {
  const card = (
    <BlurView
      intensity={60}
      tint="light"
      style={[
        {
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.6)',
          padding: 16,
          boxShadow: '0 4px 24px rgba(0,119,182,0.08)',
        },
        style,
      ]}
    >
      <View style={{ backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 16, padding: 2 }}>
        {children}
      </View>
    </BlurView>
  );

  if (onPress && hover) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
        {card}
      </Pressable>
    );
  }

  return card;
}
