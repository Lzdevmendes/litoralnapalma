import { TouchableOpacity, View, Text } from 'react-native';

interface SocialButtonProps {
  onPress: () => void;
  label: string;
  emoji: string;
  loading?: boolean;
}

export function SocialButton({ onPress, label, emoji, loading }: SocialButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        paddingVertical: 14,
        opacity: loading ? 0.6 : 1,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
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
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
        {loading ? 'Aguarde...' : label}
      </Text>
    </TouchableOpacity>
  );
}
