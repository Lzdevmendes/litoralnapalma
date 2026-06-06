import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { verifyOTP, resendEmailOTP, resendPhoneOTP, DEV_OTP } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { OTPInput } from '@/components/auth/OTPInput';
import { PrimaryButton } from '@/components/auth/SocialButton';

type OTPStatus = 'default' | 'error' | 'success';

export default function VerifyScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { locale } = useLanguage();
  const { contact, type } = useLocalSearchParams<{ contact: string; type: 'email' | 'phone' }>();

  const [code, setCode]       = useState('');
  const [seconds, setSeconds] = useState(60);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus]   = useState<OTPStatus>('default');

  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const iconBounce  = useRef(new Animated.Value(1)).current;

  const isEmail = type === 'email';
  const maskedContact = isEmail
    ? contact?.replace(/(.{2}).+(@.+)/, '$1***$2')
    : contact?.replace(/(\(\d{2}\))\s\d{4,5}-(\d{2})\d{2}/, '$1 *****-**$2');

  // Pulsação suave do ícone enquanto aguarda
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(iconBounce, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [iconBounce]);

  // Contador de reenvio
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function shake() {
    shakeAnim.setValue(0);
    Animated.timing(shakeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
      shakeAnim.setValue(0);
    });
  }

  function showSuccess(onDone: () => void) {
    setStatus('success');
    Animated.parallel([
      Animated.spring(successScale,   { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setTimeout(onDone, 700));
  }

  async function handleVerify() {
    if (code.length < 6) {
      setError(locale === 'en' ? 'Enter all 6 digits' : 'Digite os 6 dígitos do código');
      setStatus('error');
      shake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await verifyOTP(contact ?? '', code, type ?? 'email');
      showSuccess(async () => {
        await setUser(user);
        router.replace('/');
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('expired') || msg.includes('expirado')) {
        setError(locale === 'en' ? 'Code expired. Tap below to resend.' : 'Código expirado. Use o botão abaixo para reenviar.');
      } else if (msg.includes('invalid') || msg.includes('inválido') || msg.includes('token')) {
        setError(locale === 'en' ? 'Wrong code. Check and try again.' : 'Código incorreto. Verifique e tente novamente.');
      } else if (msg.includes('rate') || msg.includes('limit')) {
        setError(locale === 'en' ? 'Too many attempts. Wait a few minutes.' : 'Muitas tentativas. Aguarde alguns minutos.');
      } else if (msg) {
        setError(msg.charAt(0).toUpperCase() + msg.slice(1));
      } else {
        setError(locale === 'en' ? 'Could not verify. Please try again.' : 'Não foi possível verificar. Tente novamente.');
      }
      setStatus('error');
      shake();
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(v: string) {
    setCode(v);
    if (status !== 'default') setStatus('default');
    if (error) setError('');
  }

  async function handleResend() {
    if (resending) return;
    setResending(true);
    setCode('');
    setError('');
    setStatus('default');
    try {
      if (isEmail) await resendEmailOTP(contact ?? '');
      else await resendPhoneOTP(contact ?? '');
      setSeconds(60);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('limit')) {
        setError(locale === 'en' ? 'Too many attempts. Wait a few minutes.' : 'Muitas tentativas. Aguarde alguns minutos.');
      } else {
        setError(locale === 'en' ? 'Could not resend. Try again shortly.' : 'Não foi possível reenviar. Tente novamente.');
      }
      setSeconds(30);
    } finally {
      setResending(false);
    }
  }

  const isSuccess = status === 'success';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>

          {/* Voltar */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 14, color: '#0077b6', fontWeight: '600' }}>
              {locale === 'en' ? '← Back' : '← Voltar'}
            </Text>
          </TouchableOpacity>

          {/* Ícone animado */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            {isSuccess ? (
              <Animated.View style={{
                transform: [{ scale: successScale }],
                opacity: successOpacity,
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: '#dcfce7',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 3, borderColor: '#22c55e',
              }}>
                <Text style={{ fontSize: 38 }}>✓</Text>
              </Animated.View>
            ) : (
              <Animated.View style={{
                transform: [{ scale: iconBounce }],
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: isEmail ? 'rgba(0,119,182,0.1)' : 'rgba(5,150,105,0.1)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 40 }}>{isEmail ? '📧' : '📱'}</Text>
              </Animated.View>
            )}
          </View>

          {/* Título */}
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 10 }}>
            {isSuccess
              ? (locale === 'en' ? 'Verified! 🎉' : 'Verificado! 🎉')
              : (locale === 'en' ? 'Enter the code' : 'Confirme o código')}
          </Text>

          {!isSuccess && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 }}>
                {locale === 'en' ? 'We sent a 6-digit code to' : 'Enviamos um código de 6 dígitos para'}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', textAlign: 'center', marginTop: 2 }}>
                {maskedContact}
              </Text>
            </View>
          )}

          {/* OTP Input */}
          {!isSuccess && (
            <OTPInput
              value={code}
              onChange={handleCodeChange}
              disabled={loading || isSuccess}
              status={status}
              shakeAnim={shakeAnim}
            />
          )}

          {/* Erro */}
          {error ? (
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginTop: 14,
            }}>
              <Text style={{ fontSize: 13 }}>⚠️</Text>
              <Text style={{ fontSize: 13, color: '#ef4444', fontWeight: '600', flex: 1, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Dica dev */}
          {!isSupabaseConfigured && !isSuccess && (
            <View style={{
              backgroundColor: 'rgba(0,119,182,0.08)',
              borderRadius: 12, padding: 10,
              marginTop: 16, marginBottom: 4,
            }}>
              <Text style={{ fontSize: 12, color: '#0077b6', textAlign: 'center' }}>
                {locale === 'en' ? 'Dev mode · use code ' : 'Modo dev · use o código '}
                <Text style={{ fontWeight: '800' }}>{DEV_OTP}</Text>
              </Text>
            </View>
          )}

          {/* Confirmar */}
          {!isSuccess && (
            <View style={{ marginTop: 20, marginBottom: 20 }}>
              <PrimaryButton
                label={locale === 'en' ? 'Confirm' : 'Confirmar'}
                onPress={handleVerify}
                disabled={code.length < 6}
                loading={loading}
              />
            </View>
          )}

          {/* Reenviar */}
          {!isSuccess && (
            <View style={{ alignItems: 'center' }}>
              {seconds > 0 ? (
                <Text style={{ fontSize: 14, color: '#94a3b8' }}>
                  {locale === 'en' ? 'Resend in ' : 'Reenviar em '}
                  <Text style={{ fontWeight: '700', color: '#64748b' }}>{seconds}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: resending ? '#94a3b8' : '#0077b6' }}>
                    {resending
                      ? (locale === 'en' ? 'Sending…' : 'Enviando…')
                      : (locale === 'en' ? 'Resend code' : 'Reenviar código')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
