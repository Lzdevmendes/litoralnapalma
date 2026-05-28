import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { sendEmailOTP, sendPhoneOTP, signInWithGoogle } from '@/lib/auth';
import { SocialButton, PrimaryButton } from '@/components/auth/SocialButton';

type Method = 'email' | 'phone';

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
  const { setUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isEmailValid = emailRegex.test(email);
  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;
  const contact = method === 'email' ? email : phone;
  const isValid = method === 'email' ? isEmailValid : isPhoneValid;

  const emailError = touched && !isEmailValid ? 'E-mail inválido' : '';
  const phoneError = touched && !isPhoneValid ? 'Informe DDD + número (mínimo 10 dígitos)' : '';
  const fieldError = method === 'email' ? emailError : phoneError;

  async function handleContinue() {
    setTouched(true);
    if (!isValid) return;
    setLoading(true);
    try {
      if (method === 'email') await sendEmailOTP(email);
      else await sendPhoneOTP(phone.replace(/\D/g, ''));
      router.push(`/auth/verify?contact=${encodeURIComponent(contact)}&type=${method}`);
    } catch {
      // erro silencioso no mock
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      await setUser(user);
      router.replace('/');
    } catch {
      // erro silencioso no mock
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#e0f2fe' }}>
      {/* ── Header oceânico ────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: '#0077b6',
          paddingTop: insets.top + 32,
          paddingBottom: 56,
          paddingHorizontal: 24,
          alignItems: 'center',
          borderBottomLeftRadius: 48,
          borderBottomRightRadius: 48,
          boxShadow: '0 8px 32px rgba(0,119,182,0.3)',
        }}
      >
        <Text style={{ fontSize: 64, marginBottom: 12 }}>🌊</Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#fff',
            letterSpacing: -0.5,
            marginBottom: 6,
          }}
        >
          Litoral na Palma
        </Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', fontWeight: '500' }}>
          Entre na sua conta para continuar
        </Text>
      </View>

      {/* ── Formulário ─────────────────────────────────────────────────── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingTop: 28,
            gap: 0,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Google */}
          <SocialButton
            emoji="🔵"
            label="Continuar com Google"
            onPress={handleGoogle}
            loading={googleLoading}
          />

          {/* Divisor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#bfdbfe' }} />
            <Text style={{ fontSize: 13, color: '#94a3b8', fontWeight: '500' }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#bfdbfe' }} />
          </View>

          {/* Toggle método */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#dbeafe',
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
                  boxShadow: method === m ? '0 2px 8px rgba(0,119,182,0.12)' : undefined,
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
          <View style={{ gap: 6, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 }}>
              {method === 'email' ? 'E-mail' : 'Número de telefone'}
            </Text>
            <TextInput
              value={method === 'email' ? email : phone}
              onChangeText={(t) => {
                setTouched(false);
                if (method === 'email') setEmail(t);
                else setPhone(maskPhone(t));
              }}
              onBlur={() => setTouched(true)}
              placeholder={method === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
              keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: '#fff',
                borderWidth: 1.5,
                borderColor: fieldError ? '#ef4444' : '#bfdbfe',
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                fontSize: 16,
                color: '#1e293b',
                boxShadow: '0 1px 4px rgba(0,119,182,0.06)',
              }}
            />
            {fieldError ? (
              <Text style={{ fontSize: 13, color: '#ef4444', marginTop: 2 }}>{fieldError}</Text>
            ) : null}
          </View>

          {/* Botão continuar */}
          <PrimaryButton
            label="Continuar"
            onPress={handleContinue}
            disabled={touched && !isValid}
            loading={loading}
          />

          {/* Link cadastro */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28, gap: 4 }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0077b6' }}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: insets.bottom + 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
