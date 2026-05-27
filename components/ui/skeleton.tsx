import { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';

interface SkeletonProps {
  style?: ViewStyle;
}

export function Skeleton({ style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#E5EDF4',
          borderRadius: 16,
          height: 120,
        },
        style,
        { opacity },
      ]}
    />
  );
}

export function CardSkeleton() {
  return <Skeleton style={{ height: 130, marginBottom: 4 }} />;
}
