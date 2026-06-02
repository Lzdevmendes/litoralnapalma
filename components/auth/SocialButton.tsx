import { TouchableOpacity, View, Text } from 'react-native';

interface SocialButtonProps {
  onPress: () => void;
  label: string;
  emoji: string;
  loading?: boolean;
  disabled?: boolean;
}

export function SocialButton({ onPress, label, emoji, loading, disabled }: SocialButtonProps) {
  const inactive = loading || disabled;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#dbeafe',
        borderRadius: 16,
        paddingVertical: 16,
        opacity: inactive ? 0.6 : 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1e293b' }}>
        {loading ? 'Aguarde...' : label}
      </Text>
    </TouchableOpacity>
  );
}

interface PrimaryButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ onPress, label, disabled, loading }: PrimaryButtonProps) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      style={{
        backgroundColor: inactive ? '#94a3b8' : '#0077b6',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        boxShadow: inactive ? undefined : '0 6px 20px rgba(0,119,182,0.38)',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 }}>
        {loading ? 'Aguarde...' : label}
      </Text>
    </TouchableOpacity>
  );
}
