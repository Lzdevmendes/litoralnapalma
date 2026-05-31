import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { verifyOTP, resendEmailOTP, resendPhoneOTP, DEV_OTP } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { OTPInput } from '@/components/auth/OTPInput';
import { PrimaryButton } from '@/components/auth/SocialButton';

export default function VerifyScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { contact, type } = useLocalSearchParams<{ contact: string; type: 'email' | 'phone' }>();

  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const isEmail = type === 'email';
  const maskedContact = isEmail
    ? contact?.replace(/(.{2}).+(@.+)/, '$1***$2')
    : contact?.replace(/(\(\d{2}\))\s\d{4,5}-(\d{2})\d{2}/, '$1 *****-**$2');

  // Contador de reenvio
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function handleVerify() {
    if (code.length < 6) {
      setError('Digite os 6 dígitos do código');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await verifyOTP(contact ?? '', code, type ?? 'email');
      await setUser(user);
      router.replace('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('expired') || msg.includes('expirado')) {
        setError('Código expirado. Use o botão abaixo para reenviar.');
      } else if (msg.includes('invalid') || msg.includes('inválido') || msg.includes('token')) {
        setError('Código incorreto. Verifique e tente novamente.');
      } else if (msg.includes('rate') || msg.includes('limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else if (msg) {
        setError(msg.charAt(0).toUpperCase() + msg.slice(1));
      } else {
        setError('Não foi possível verificar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resending) return;
    setResending(true);
    setCode('');
    setError('');
    try {
      if (isEmail) await resendEmailOTP(contact ?? '');
      else await resendPhoneOTP(contact ?? '');
      setSeconds(60);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('email')) {
        setError('Endereço inválido. Volte e verifique o e-mail digitado.');
      } else {
        setError('Não foi possível reenviar. Tente novamente em instantes.');
      }
      setSeconds(30); // permite nova tentativa após 30s mesmo com erro
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          {/* Voltar */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 40 }}>
            <Text style={{ fontSize: 14, color: '#0077b6', fontWeight: '600' }}>← Voltar</Text>
          </TouchableOpacity>

          {/* Ícone */}
          <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 24 }}>
            {isEmail ? '📧' : '📱'}
          </Text>

          {/* Título */}
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
            Confirme o código
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
            Enviamos um código de 6 dígitos para{'\n'}
            <Text style={{ fontWeight: '700', color: '#374151' }}>{maskedContact}</Text>
          </Text>

          {/* OTP Input */}
          <OTPInput value={code} onChange={setCode} disabled={loading} />

          {/* Erro */}
          {error ? (
            <Text style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginTop: 12 }}>
              {error}
            </Text>
          ) : null}

          {/* Dica dev — visível apenas sem Supabase configurado */}
          {!isSupabaseConfigured && (
            <View
              style={{
                backgroundColor: 'rgba(0,119,182,0.08)',
                borderRadius: 10,
                padding: 10,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: '#0077b6', textAlign: 'center' }}>
                Modo desenvolvimento · use o código{' '}
                <Text style={{ fontWeight: '800' }}>{DEV_OTP}</Text>
              </Text>
            </View>
          )}

          {/* Botão confirmar */}
          <View style={{ marginTop: 8, marginBottom: 24 }}>
            <PrimaryButton
              label="Confirmar"
              onPress={handleVerify}
              disabled={code.length < 6}
              loading={loading}
            />
          </View>

          {/* Reenviar */}
          <View style={{ alignItems: 'center' }}>
            {seconds > 0 ? (
              <Text style={{ fontSize: 14, color: '#94a3b8' }}>
                Reenviar código em{' '}
                <Text style={{ fontWeight: '700', color: '#64748b' }}>{seconds}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: resending ? '#94a3b8' : '#0077b6' }}>
                  {resending ? 'Enviando…' : 'Reenviar código'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
