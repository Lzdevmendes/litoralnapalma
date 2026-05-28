import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 0 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 48 }}>🌊</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#0077b6', marginTop: 8 }}>
              Litoral na Palma
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Entre na sua conta
            </Text>
          </View>

          {/* Google */}
          <SocialButton
            emoji="🔵"
            label="Continuar com Google"
            onPress={handleGoogle}
            loading={googleLoading}
          />

          {/* Divisor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
          </View>

          {/* Toggle método */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#e2e8f0',
              borderRadius: 12,
              padding: 4,
              marginBottom: 16,
            }}
          >
            {(['email', 'phone'] as Method[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMethod(m); setTouched(false); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: method === m ? '#fff' : 'transparent',
                  boxShadow: method === m ? '0 1px 3px rgba(0,0,0,0.1)' : undefined,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: method === m ? '700' : '400',
                    color: method === m ? '#0077b6' : '#64748b',
                  }}
                >
                  {m === 'email' ? '📧 E-mail' : '📱 Telefone'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de entrada */}
          <View style={{ gap: 4, marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
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
                borderColor: fieldError ? '#ef4444' : '#e2e8f0',
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#1e293b',
              }}
            />
            {fieldError ? (
              <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{fieldError}</Text>
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
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0077b6' }}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
