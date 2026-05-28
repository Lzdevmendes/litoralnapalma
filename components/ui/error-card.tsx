import { View, Text, Pressable } from 'react-native';
import { useLanguage } from '@/context/language-context';
import type { Translations } from '@/lib/i18n';

interface ErrorCardProps {
  error?: unknown;
  onRetry?: () => void;
}

function getErrorInfo(
  error: unknown,
  t: Translations['error']
): { emoji: string; title: string; message: string } {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('network request failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('timeout')
    ) {
      return { emoji: '📡', title: t.noConnection, message: t.noConnectionMsg };
    }
  }
  return { emoji: '⚠️', title: t.loadError, message: t.loadErrorMsg };
}

export function ErrorCard({ error, onRetry }: ErrorCardProps) {
  const { t } = useLanguage();
  const { emoji, title, message } = getErrorInfo(error, t.error);

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.2)',
        boxShadow: '0 2px 12px rgba(239,68,68,0.06)',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: 'rgba(239,68,68,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>

      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>{message}</Text>
      </View>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#005f92' : '#0077b6',
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 10,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{t.error.retry}</Text>
        </Pressable>
      )}
    </View>
  );
}
