import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { sendEmailOTP, sendPhoneOTP } from '@/lib/auth';
import { PrimaryButton } from '@/components/auth/SocialButton';
import { VideoBackground } from '@/components/ui/video-background';
import { useLanguage } from '@/context/language-context';

type Method = 'email' | 'phone';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const beachVideo = require('../../assets/videos/beach.mp4');

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = emailRegex.test(email);
  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;
  const contact = method === 'email' ? email : phone;
  const isValid = method === 'email' ? isEmailValid : isPhoneValid;

  const emailError = touched && !isEmailValid ? t.auth.emailInvalid : '';
  const phoneError = touched && !isPhoneValid ? t.auth.phoneInvalid : '';
  const fieldError = method === 'email' ? emailError : phoneError;

  async function handleContinue() {
    setTouched(true);
    setError('');
    if (!isValid) return;
    setLoading(true);
    try {
      if (method === 'email') await sendEmailOTP(email);
      else await sendPhoneOTP(phone.replace(/\D/g, ''));
      router.push(`/auth/verify?contact=${encodeURIComponent(contact)}&type=${method}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('not found') || msg.includes('no user') || msg.includes('signups not allowed')) {
        setError(t.auth.accountNotFound);
      } else if (msg.includes('rate') || msg.includes('limit') || msg.includes('security')) {
        setError(t.auth.tooManyAttempts);
      } else if (msg.includes('invalid') || msg.includes('inválido')) {
        setError(t.auth.invalidContact);
      } else if (msg.includes('phone') || msg.includes('sms') || msg.includes('otp')) {
        setError(t.auth.smsError);
      } else {
        setError(t.auth.sendError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#003d5c' }}>

      {/* ── Camada 1: vídeo de praia em loop ─────────────────────────── */}
      <VideoBackground source={beachVideo} />

      {/* ── Camada 2: overlay escuro gradiente de cima para baixo ─────── */}
      <View
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,20,40,0.38)',
        }}
        pointerEvents="none"
      />

      {/* ── Camada 3: hero da marca (sobre o vídeo) ───────────────────── */}
      <View
        style={{
          paddingTop: insets.top + 48,
          paddingHorizontal: 32,
          alignItems: 'center',
          flex: 1,
        }}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 72, marginBottom: 14 }}>🌊</Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: -0.5,
            marginBottom: 8,
            textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.4)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          }}
        >
          Litoral na Palma
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.82)',
            fontWeight: '500',
            textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
          }}
        >
          {t.auth.signInTagline}
        </Text>
      </View>

      {/* ── Camada 4: modal de login com blur na borda superior ────────── */}
      <KeyboardAvoidingView behavior="padding">

        {/* Faixa de blur delimitando vídeo → form */}
        <BlurView
          intensity={28}
          tint="dark"
          style={{
            height: 40,
            marginBottom: -1,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            overflow: 'hidden',
          }}
        />

        {/* Card do formulário */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            marginTop: -40,
            paddingTop: 8,
            boxShadow: '0 -4px 40px rgba(0,0,0,0.35)',
          }}
        >
          {/* Alça visual */}
          <View
            style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: '#cbd5e1',
              alignSelf: 'center',
              marginTop: 10,
              marginBottom: 20,
            }}
          />

          <ScrollView
            contentContainerStyle={{ padding: 24, paddingTop: 0, gap: 0 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Toggle método */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#f1f5f9',
                borderRadius: 14,
                padding: 4,
                marginBottom: 20,
              }}
            >
              {(['email', 'phone'] as Method[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => { setMethod(m); setTouched(false); }}
                  style={{
                    flex: 1,
                    paddingVertical: 11,
                    borderRadius: 11,
                    alignItems: 'center',
                    backgroundColor: method === m ? '#fff' : 'transparent',
                    boxShadow: method === m ? '0 2px 8px rgba(0,0,0,0.1)' : undefined,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: method === m ? '700' : '500',
                      color: method === m ? '#0077b6' : '#64748b',
                    }}
                  >
                    {m === 'email' ? '📧 E-mail' : '📱 Telefone'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campo de entrada */}
            <View style={{ gap: 6, marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 }}>
                {method === 'email' ? 'E-mail' : 'Número de telefone'}
              </Text>
              <TextInput
                value={method === 'email' ? email : phone}
                onChangeText={(v) => {
                  setTouched(false);
                  if (method === 'email') setEmail(v);
                  else setPhone(maskPhone(v));
                }}
                onBlur={() => setTouched(true)}
                placeholder={method === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1.5,
                  borderColor: fieldError ? '#ef4444' : '#e2e8f0',
                  borderRadius: 16,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: '#1e293b',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              />
              {fieldError ? (
                <Text style={{ fontSize: 13, color: '#ef4444', marginTop: 2 }}>{fieldError}</Text>
              ) : null}
            </View>

            {/* Botão continuar */}
            <PrimaryButton
              label={t.auth.continue}
              onPress={handleContinue}
              disabled={touched && !isValid}
              loading={loading}
            />

            {error ? (
              <Text style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginTop: 12 }}>
                {error}
              </Text>
            ) : null}

            {/* Link cadastro */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#64748b' }}>{t.auth.noAccount}</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0077b6' }}>{t.auth.signUp}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: insets.bottom + 16 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
