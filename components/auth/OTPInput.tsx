import { useRef } from 'react';
import { View, TextInput, Animated } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  status?: 'default' | 'error' | 'success';
  shakeAnim?: Animated.Value;
}

export function OTPInput({ value, onChange, disabled, status = 'default', shakeAnim }: OTPInputProps) {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  function handleChange(index: number, text: string) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      onChange(next.join(''));
      inputsRef.current[index - 1]?.focus();
    }
  }

  const borderColor = status === 'error' ? '#ef4444' : status === 'success' ? '#22c55e' : undefined;
  const bgTint      = status === 'error' ? 'rgba(239,68,68,0.06)' : status === 'success' ? 'rgba(34,197,94,0.08)' : undefined;

  const translateX = shakeAnim
    ? shakeAnim.interpolate({ inputRange: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1], outputRange: [0, -10, 10, -8, 8, -4, 0] })
    : undefined;

  return (
    <Animated.View
      style={[
        { flexDirection: 'row', gap: 10, justifyContent: 'center' },
        translateX ? { transform: [{ translateX }] } : undefined,
      ]}
    >
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = !!digits[i];
        return (
          <TextInput
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            value={digits[i] || ''}
            onChangeText={(text) => handleChange(i, text)}
            onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(i, key)}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            editable={!disabled}
            style={{
              width: 50,
              height: 62,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: borderColor ?? (filled ? '#0077b6' : '#e2e8f0'),
              textAlign: 'center',
              fontSize: 26,
              fontWeight: '800',
              color: status === 'error' ? '#ef4444' : status === 'success' ? '#16a34a' : '#1e293b',
              backgroundColor: bgTint ?? (filled ? 'rgba(0,119,182,0.06)' : '#fff'),
            }}
          />
        );
      })}
    </Animated.View>
  );
}
