import Svg, { Circle, Path } from 'react-native-svg';
import type { ViewStyle } from 'react-native';

interface LogoSymbolProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function LogoSymbol({ size = 80, color = '#ffffff', style }: LogoSymbolProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="118 101 480 480"
      style={style}
    >
      <Circle cx="360" cy="246.938" r="64.453" fill={color} />
      <Path
        d="M147.891 387.562C198.672 356.313 249.453 356.313 300.234 387.562C351.016 418.812 401.797 418.812 452.578 387.562C503.359 356.313 542.422 356.313 569.766 387.562"
        stroke={color}
        strokeWidth="32.8125"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M147.891 469.594C198.672 438.344 249.453 438.344 300.234 469.594C351.016 500.844 401.797 500.844 452.578 469.594C503.359 438.344 542.422 438.344 569.766 469.594"
        stroke={color}
        strokeWidth="32.8125"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.85}
      />
    </Svg>
  );
}
