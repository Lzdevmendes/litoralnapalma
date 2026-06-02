import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export function FavoriteButton({ isFavorite, onToggle, size = 20 }: FavoriteButtonProps) {
  function handlePress() {
    Haptics.selectionAsync();
    onToggle();
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontSize: size }}>{isFavorite ? '❤️' : '🤍'}</Text>
    </Pressable>
  );
}
