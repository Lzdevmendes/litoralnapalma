import { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCity } from '@/context/city-context';
import { useLanguage } from '@/context/language-context';
import { useUserMode } from '@/context/user-mode-context';
import { useAuth } from '@/context/auth-context';
import { signOut } from '@/lib/auth';
import { CITIES } from '@/data/cities';
import { C } from '@/lib/design';

const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';

export function Header() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { city, setCity } = useCity();
  const { locale, setLocale, t } = useLanguage();
  const { mode } = useUserMode();
  const { user, setUser } = useAuth();
  const rotation = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  async function handleRefresh() {
    rotation.setValue(0);
    spinRef.current = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 700, useNativeDriver: true })
    );
    spinRef.current.start();
    await queryClient.invalidateQueries();
    spinRef.current?.stop();
    spinRef.current = null;
    rotation.setValue(0);
  }

  async function handleSignOut() {
    setShowUserMenu(false);
    Alert.alert(
      t.nav.signOut,
      t.nav.signOutConfirm,
      [
        { text: t.nav.cancel, style: 'cancel' },
        {
          text: t.nav.signOut,
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            await signOut();
            await setUser(null);
            router.replace('/auth/login');
          },
        },
      ]
    );
  }

  return (
    <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.borderBlue }}>

      {/* ── LINHA 1: logo + ações ──────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        gap: 8,
      }}>
        {/* Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 11,
            backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,119,182,0.4)',
          }}>
            <Text style={{ fontSize: 19 }}>🧭</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: C.primary, letterSpacing: -0.3 }}>
              Litoral na Palma
            </Text>
            <Text style={{ fontSize: 10, color: C.textMuted }}>📍 {city.name}</Text>
          </View>
        </View>

        {/* Ações à direita: idioma | refresh | perfil */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* Language */}
          <Pressable
            onPress={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
            style={({ pressed }) => ({
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: pressed ? C.primary12 : C.primary08,
              alignItems: 'center', justifyContent: 'center',
            })}
          >
            <Text style={{ fontSize: 17 }}>{locale === 'pt' ? '🇧🇷' : '🇺🇸'}</Text>
          </Pressable>

          {/* Refresh */}
          <Pressable
            onPress={handleRefresh}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.primary08, alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.Text style={{ fontSize: 16, transform: [{ rotate: spin }] }}>🔄</Animated.Text>
          </Pressable>

          {/* Avatar / menu */}
          <Pressable
            onPress={() => setShowUserMenu(true)}
            style={({ pressed }) => ({
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: pressed ? C.primary20 : C.primary12,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1.5, borderColor: C.primary20,
            })}
          >
            <Text style={{ fontSize: 15 }}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* ── LINHA 2: modo atual ────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: mode === 'morador' ? C.primary08 : 'rgba(5,150,105,0.08)',
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 9,
          borderWidth: 1,
          borderColor: mode === 'morador' ? C.primary20 : 'rgba(5,150,105,0.18)',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 14 }}>{mode === 'morador' ? '🏠' : '✈️'}</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: mode === 'morador' ? C.primary : '#059669' }}>
              {mode === 'morador' ? t.settings.modeResident.replace('🏠 ', '') : t.settings.modeTourist.replace('✈️ ', '')}
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.textMuted }}>
            {t.header.changeInSettings}
          </Text>
        </View>
      </View>

      {/* ── LINHA 3: cidade ───────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingBottom: 12 }}
      >
        {CITIES.map((c) => {
          const active = c.id === city.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCity(c)}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                backgroundColor: active ? C.primary : C.primary08,
                borderWidth: 1,
                borderColor: active ? C.primary : C.primary20,
                boxShadow: active ? '0 2px 8px rgba(0,119,182,0.25)' : undefined,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : C.primary }}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Modal de perfil ───────────────────────────────── */}
      <Modal visible={showUserMenu} transparent animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setShowUserMenu(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 60, right: 12,
              backgroundColor: '#fff', borderRadius: 20, padding: 16, minWidth: 210,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)', gap: 4,
            }}
          >
            {/* Perfil */}
            <View style={{ paddingHorizontal: 4, paddingBottom: 10, gap: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>
                {user?.name ?? t.nav.user}
              </Text>
              {(user?.email || user?.phone) && (
                <Text style={{ fontSize: 11, color: C.textMuted }} numberOfLines={1}>
                  {user.email ?? user.phone}
                </Text>
              )}
            </View>

            <View style={{ height: 1, backgroundColor: C.primary08, marginHorizontal: -4 }} />

            <MenuRow
              emoji="⚙️"
              label={t.nav.settings}
              onPress={() => { setShowUserMenu(false); router.push('/settings'); }}
            />
            <MenuRow
              emoji="🌐"
              label={locale === 'pt' ? t.settings.langEn : t.settings.langPt}
              onPress={() => { setLocale(locale === 'pt' ? 'en' : 'pt'); setShowUserMenu(false); }}
            />

            <View style={{ height: 1, backgroundColor: C.primary08, marginHorizontal: -4 }} />

            <MenuRow
              emoji="🚪"
              label={t.nav.signOut}
              onPress={handleSignOut}
              danger
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MenuRow({ emoji, label, onPress, danger }: {
  emoji: string; label: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12,
        backgroundColor: pressed ? (danger ? '#fef2f2' : C.primary08) : 'transparent',
      })}
    >
      <Text style={{ fontSize: 17, width: 24, textAlign: 'center' }}>{emoji}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: danger ? C.danger : C.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}
