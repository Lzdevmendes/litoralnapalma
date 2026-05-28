import { useRef } from 'react';
import { View, TextInput } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  function handleChange(index: number, text: string) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      onChange(next.join(''));
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
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
              width: 48,
              height: 58,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: filled ? '#0077b6' : '#e2e8f0',
              textAlign: 'center',
              fontSize: 24,
              fontWeight: '700',
              color: '#1e293b',
              backgroundColor: filled ? 'rgba(0,119,182,0.06)' : '#fff',
            }}
          />
        );
      })}
    </View>
  );
}
