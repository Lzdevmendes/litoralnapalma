import { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { useUserMode } from '@/context/user-mode-context';
import { signOut } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CITIES } from '@/data/cities';
import type { Locale } from '@/lib/i18n';
import type { UserMode } from '@/lib/types';

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
      }}
    >
      {children}
    </View>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}

interface RowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
  last?: boolean;
}

function Row({ icon, label, value, onPress, danger, right, last }: RowProps) {
  const color = danger ? '#ef4444' : '#1e293b';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: pressed && onPress ? '#f8fafc' : 'transparent',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
      })}
    >
      <Text style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 15, color, fontWeight: danger ? '600' : '400' }}>{label}</Text>
      {value ? <Text style={{ fontSize: 14, color: '#94a3b8' }}>{value}</Text> : null}
      {right ?? null}
      {onPress && !right ? <Text style={{ fontSize: 16, color: '#cbd5e1' }}>›</Text> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const { city, setCity } = useCity();
  const { locale, setLocale } = useLanguage();
  const { mode, setMode } = useUserMode();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  function toggleLocale() {
    setLocale(locale === 'pt' ? 'en' : 'pt');
  }

  function toggleMode() {
    setMode(mode === 'morador' ? 'turista' : 'morador');
  }

  function handleCitySelect() {
    Alert.alert(
      'Selecionar cidade',
      undefined,
      [
        ...CITIES.map((c) => ({
          text: c.name + (c.id === city.id ? ' ✓' : ''),
          onPress: () => setCity(c),
        })),
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  }

  async function handleSignOut() {
    Alert.alert(
      'Sair da conta',
      'Deseja sair do Litoral na Palma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut().catch(() => {});
            await setUser(null);
            setSigningOut(false);
            router.replace('/auth/login');
          },
        },
      ],
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Excluir conta',
      'Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar exclusão',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ],
    );
  }

  async function confirmDeleteAccount() {
    if (!isSupabaseConfigured || !supabase) {
      // Modo mock — apenas limpa sessão local
      await setUser(null);
      router.replace('/auth/login');
      return;
    }

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Sem sessão ativa');

      const res = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.error) throw res.error;

      await supabase.auth.signOut();
      await setUser(null);
      router.replace('/auth/login');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível excluir a conta: ${msg}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: pressed ? '#e0f2fe' : '#f0f9ff',
            alignItems: 'center', justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 18, color: '#0077b6' }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b', flex: 1 }}>Configurações</Text>
        <Text style={{ fontSize: 22 }}>⚙️</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <SectionTitle label="Perfil" />
        <SectionCard>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              gap: 14,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#0077b6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>
                {user?.name ?? 'Usuário'}
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {user?.email ?? user?.phone ?? 'Sem contato'}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Preferences */}
        <SectionTitle label="Preferências" />
        <SectionCard>
          <Row
            icon="🏙️"
            label="Cidade"
            value={city.name}
            onPress={handleCitySelect}
          />
          <Row
            icon="👤"
            label="Modo"
            value={mode === 'morador' ? '🏠 Morador' : '✈️ Turista'}
            right={
              <Switch
                value={mode === 'turista'}
                onValueChange={() => toggleMode()}
                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                thumbColor={mode === 'turista' ? '#0077b6' : '#f1f5f9'}
              />
            }
          />
          <Row
            icon="🌍"
            label="Idioma"
            value={locale === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
            right={
              <Switch
                value={locale === 'en'}
                onValueChange={() => toggleLocale()}
                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                thumbColor={locale === 'en' ? '#0077b6' : '#f1f5f9'}
              />
            }
            last
          />
        </SectionCard>

        {/* About */}
        <SectionTitle label="Sobre o App" />
        <SectionCard>
          <Row
            icon="📄"
            label="Termos de Uso"
            onPress={() => router.push('/legal/terms')}
          />
          <Row
            icon="🔒"
            label="Política de Privacidade"
            onPress={() => router.push('/legal/privacy')}
          />
          <Row
            icon="📱"
            label="Versão"
            value="1.0.0"
            last
          />
        </SectionCard>

        {/* Account */}
        <SectionTitle label="Conta" />
        <SectionCard>
          <Row
            icon={signingOut ? '⏳' : '🚪'}
            label={signingOut ? 'Saindo...' : 'Sair da conta'}
            onPress={signingOut ? undefined : handleSignOut}
            right={signingOut ? <ActivityIndicator size="small" color="#64748b" /> : undefined}
          />
          <Row
            icon={deleting ? '⏳' : '🗑️'}
            label={deleting ? 'Excluindo conta...' : 'Excluir minha conta'}
            danger={!deleting}
            onPress={deleting ? undefined : handleDeleteAccount}
            right={deleting ? <ActivityIndicator size="small" color="#ef4444" /> : undefined}
            last
          />
        </SectionCard>

        <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
          Litoral na Palma · Litoral Norte SP · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
