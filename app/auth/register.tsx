import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signUpWithEmail, signUpWithPhone, signInWithGoogle } from '@/lib/auth';
import { PrimaryButton, SocialButton } from '@/components/auth/SocialButton';

type Method = 'email' | 'phone';

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words';
}

function Field({ label, value, onChangeText, placeholder, error, keyboardType = 'default', secureTextEntry, autoCapitalize = 'none' }: FieldProps) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={{
          backgroundColor: '#fff',
          borderWidth: 1.5,
          borderColor: error ? '#ef4444' : '#e2e8f0',
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: '#1e293b',
        }}
      />
      {error ? <Text style={{ fontSize: 12, color: '#ef4444' }}>{error}</Text> : null}
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Validações
  const nameError = submitted && name.trim().length < 2 ? 'Informe seu nome completo' : '';
  const emailError = submitted && method === 'email' && !emailRegex.test(email) ? 'E-mail inválido' : '';
  const phoneError = submitted && method === 'phone' && phone.replace(/\D/g, '').length < 10
    ? 'Informe DDD + número (mínimo 10 dígitos)' : '';
  const termsError = submitted && !acceptedTerms ? 'Aceite os termos para continuar' : '';

  const isValid =
    name.trim().length >= 2 &&
    (method === 'email'
      ? emailRegex.test(email)
      : phone.replace(/\D/g, '').length >= 10) &&
    acceptedTerms;

  const contact = method === 'email' ? email : phone;

  async function handleRegister() {
    setSubmitted(true);
    setError('');
    if (!isValid) return;
    setLoading(true);
    try {
      if (method === 'email') await signUpWithEmail(name.trim(), email);
      else await signUpWithPhone(name.trim(), phone.replace(/\D/g, ''));
      router.push(`/auth/verify?contact=${encodeURIComponent(contact)}&type=${method}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('rate') || msg.includes('limit') || msg.includes('security')) {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else if (msg.includes('already') || msg.includes('exists')) {
        setError('E-mail já cadastrado. Tente fazer login.');
      } else if (msg.includes('invalid') || msg.includes('inválido')) {
        setError(`${method === 'email' ? 'E-mail' : 'Telefone'} inválido.`);
      } else if (msg.includes('phone') || msg.includes('sms') || msg.includes('otp')) {
        setError('Não foi possível enviar o SMS. Tente cadastrar com e-mail.');
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 0 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: '#0077b6', fontWeight: '600' }}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 26, fontWeight: '800', color: '#1e293b', marginBottom: 4 }}>
            Criar conta
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            Preencha todos os campos para continuar
          </Text>

          <SocialButton
            emoji="🔵"
            label="Cadastrar com Google"
            onPress={async () => {
              setError('');
              setGoogleLoading(true);
              try {
                await signInWithGoogle();
              } catch (err) {
                const msg = err instanceof Error ? err.message : '';
                if (msg === 'LOGIN_CANCELLED') return;
                if (msg === 'EXPO_GO_NOT_SUPPORTED') {
                  setError('Login com Google disponível apenas no app instalado — use e-mail ou telefone aqui.');
                  return;
                }
                setError('Não foi possível entrar com Google. Tente novamente.');
              } finally {
                setGoogleLoading(false);
              }
            }}
            loading={googleLoading}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            <Text style={{ fontSize: 13, color: '#94a3b8' }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
          </View>

          <View style={{ gap: 16 }}>
            {/* Nome */}
            <Field
              label="Nome completo"
              value={name}
              onChangeText={setName}
              placeholder="João da Silva"
              error={nameError}
              autoCapitalize="words"
            />

            {/* Toggle método */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Contato
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#e2e8f0',
                  borderRadius: 12,
                  padding: 4,
                  marginBottom: 10,
                }}
              >
                {(['email', 'phone'] as Method[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => { setMethod(m); setSubmitted(false); }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: method === m ? '#fff' : 'transparent',
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

              {method === 'email' ? (
                <Field
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  error={emailError}
                  keyboardType="email-address"
                />
              ) : (
                <Field
                  label="Telefone"
                  value={phone}
                  onChangeText={(t) => setPhone(maskPhone(t))}
                  placeholder="(11) 99999-9999"
                  error={phoneError}
                  keyboardType="phone-pad"
                />
              )}
            </View>

            {/* Aviso de código OTP */}
            <View
              style={{
                backgroundColor: 'rgba(0,119,182,0.07)',
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 14 }}>🔐</Text>
              <Text style={{ fontSize: 12, color: '#0077b6', flex: 1, lineHeight: 18 }}>
                Você receberá um código de verificação{method === 'email' ? ' no e-mail' : ' por SMS'} para confirmar seu cadastro.
              </Text>
            </View>

            {/* Termos */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <Pressable
                onPress={() => setAcceptedTerms((v) => !v)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: acceptedTerms ? '#0077b6' : (termsError ? '#ef4444' : '#cbd5e1'),
                  backgroundColor: acceptedTerms ? '#0077b6' : '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                {acceptedTerms && <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>}
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#374151', lineHeight: 22 }}>
                  Li e aceito os{' '}
                  <Text
                    onPress={() => router.push('/legal/terms')}
                    style={{ color: '#0077b6', fontWeight: '600', textDecorationLine: 'underline' }}
                  >
                    termos de uso
                  </Text>
                  {' '}e a{' '}
                  <Text
                    onPress={() => router.push('/legal/privacy')}
                    style={{ color: '#0077b6', fontWeight: '600', textDecorationLine: 'underline' }}
                  >
                    política de privacidade
                  </Text>
                </Text>
                {termsError ? (
                  <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{termsError}</Text>
                ) : null}
              </View>
            </View>

            {/* Botão criar conta */}
            <PrimaryButton
              label="Criar conta"
              onPress={handleRegister}
              disabled={submitted && !isValid}
              loading={loading}
            />

            {error ? (
              <Text style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginTop: 4 }}>
                {error}
              </Text>
            ) : null}

            {/* Link login */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Já tem conta?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0077b6' }}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
