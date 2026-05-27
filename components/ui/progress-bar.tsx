import { View } from 'react-native';

interface ProgressBarProps {
  value: number; // 0–100
  color: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 6 }: ProgressBarProps) {
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: 'rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.min(value, 100)}%`,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
