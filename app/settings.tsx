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
import { C, R } from '@/lib/design';

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: '700', color: C.textMuted,
      textTransform: 'uppercase', letterSpacing: 1,
      paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4,
    }}>
      {label}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: '#fff', borderRadius: R.card,
      borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    }}>
      {children}
    </View>
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
  const txtColor = danger ? C.danger : C.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 15,
        backgroundColor: pressed && onPress ? C.primary08 : 'transparent',
        borderBottomWidth: last ? 0 : 1, borderBottomColor: '#f1f5f9',
        gap: 12, minHeight: 52,
      })}
    >
      <Text style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 15, color: txtColor, fontWeight: danger ? '600' : '400' }}>
        {label}
      </Text>
      {value ? <Text style={{ fontSize: 14, color: C.textMuted }}>{value}</Text> : null}
      {right ?? null}
      {onPress && !right ? <Text style={{ fontSize: 18, color: C.textMuted }}>›</Text> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const { city, setCity } = useCity();
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useUserMode();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  function handleCitySelect() {
    Alert.alert(
      t.settings.selectCity,
      undefined,
      [
        ...CITIES.map((c) => ({
          text: c.name + (c.id === city.id ? ' ✓' : ''),
          onPress: () => setCity(c),
        })),
        { text: t.nav.cancel, style: 'cancel' as const },
      ],
    );
  }

  async function handleSignOut() {
    Alert.alert(
      t.nav.signOut,
      t.nav.signOutConfirm,
      [
        { text: t.nav.cancel, style: 'cancel' },
        {
          text: t.nav.signOut,
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
      t.nav.deleteAccount,
      t.nav.deleteConfirm,
      [
        { text: t.nav.cancel, style: 'cancel' },
        {
          text: t.nav.confirmDelete,
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ],
    );
  }

  async function confirmDeleteAccount() {
    if (!isSupabaseConfigured || !supabase) {
      await setUser(null);
      router.replace('/auth/login');
      return;
    }
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error(t.nav.noSession);
      const res = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw res.error;
      await supabase.auth.signOut();
      await setUser(null);
      router.replace('/auth/login');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(t.nav.genericError, msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: C.border, gap: 12,
      }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: pressed ? C.primary12 : C.primary08,
            alignItems: 'center', justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 17, color: C.primary }}>←</Text>
        </Pressable>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: C.textPrimary }}>
          {t.settings.title}
        </Text>
        <Text style={{ fontSize: 20 }}>⚙️</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 6, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil */}
        <SectionLabel label={t.settings.profile} />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}>
            <View style={{
              width: 54, height: 54, borderRadius: 27,
              backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary }}>
                {user?.name ?? t.nav.user}
              </Text>
              <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
                {user?.email ?? user?.phone ?? '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Preferências */}
        <SectionLabel label={t.settings.preferences} />
        <Card>
          <Row
            icon="🏙️"
            label={t.settings.city}
            value={city.name}
            onPress={handleCitySelect}
          />
          <Row
            icon="👤"
            label={t.settings.mode}
            value={mode === 'morador' ? t.settings.modeResident : t.settings.modeTourist}
            right={
              <Switch
                value={mode === 'turista'}
                onValueChange={(v) => setMode(v ? 'turista' : 'morador')}
                trackColor={{ false: '#e2e8f0', true: C.primary20 }}
                thumbColor={mode === 'turista' ? C.primary : '#f1f5f9'}
              />
            }
          />
          <Row
            icon="🌐"
            label={t.settings.language}
            value={locale === 'pt' ? t.settings.langPt : t.settings.langEn}
            right={
              <Switch
                value={locale === 'en'}
                onValueChange={(v) => setLocale(v ? 'en' : 'pt')}
                trackColor={{ false: '#e2e8f0', true: C.primary20 }}
                thumbColor={locale === 'en' ? C.primary : '#f1f5f9'}
              />
            }
            last
          />
        </Card>

        {/* Sobre */}
        <SectionLabel label={t.settings.about} />
        <Card>
          <Row icon="📄" label={t.settings.terms}   onPress={() => router.push('/legal/terms')} />
          <Row icon="🔒" label={t.settings.privacy}  onPress={() => router.push('/legal/privacy')} />
          <Row icon="📱" label={t.settings.version}  value="1.0.0" last />
        </Card>

        {/* Conta */}
        <SectionLabel label={t.settings.account} />
        <Card>
          <Row
            icon={signingOut ? '⏳' : '🚪'}
            label={signingOut ? t.nav.signingOut : t.nav.signOut}
            onPress={signingOut ? undefined : handleSignOut}
            right={signingOut ? <ActivityIndicator size="small" color={C.textMuted} /> : undefined}
          />
          <Row
            icon={deleting ? '⏳' : '🗑️'}
            label={deleting ? t.nav.deleting : t.nav.deleteAccount}
            danger={!deleting}
            onPress={deleting ? undefined : handleDeleteAccount}
            right={deleting ? <ActivityIndicator size="small" color={C.danger} /> : undefined}
            last
          />
        </Card>

        <Text style={{ fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 12 }}>
          Litoral na Palma · Litoral Norte SP · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
