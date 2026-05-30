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
import type { UserMode } from '@/lib/types';

const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';

const BLUE = '#0077b6';

export function Header() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { city, setCity } = useCity();
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useUserMode();
  const { user, setUser } = useAuth();
  const rotation = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  async function handleRefresh() {
    rotation.setValue(0);
    spinRef.current = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 800, useNativeDriver: true })
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
      'Sair da conta',
      'Deseja encerrar sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
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
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,119,182,0.08)',
        boxShadow: '0 1px 8px rgba(0,119,182,0.06)',
      }}
    >
      {/* Linha principal */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          gap: 8,
        }}
      >
        {/* Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: BLUE,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,119,182,0.35)',
            }}
          >
            <Text style={{ fontSize: 20 }}>🧭</Text>
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: BLUE, letterSpacing: -0.2 }}>
              Litoral na Palma
            </Text>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>📍 {city.name}, SP</Text>
          </View>
        </View>

        {/* Mode toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#f1f5f9',
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {(['morador', 'turista'] as UserMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 9,
                backgroundColor: mode === m ? BLUE : 'transparent',
                boxShadow: mode === m ? '0 1px 4px rgba(0,119,182,0.3)' : undefined,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: mode === m ? '#fff' : '#64748b',
                }}
              >
                {m === 'morador' ? t.header.resident : t.header.tourist}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Language toggle */}
        <Pressable
          onPress={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: pressed ? `${BLUE}20` : `${BLUE}10`,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 18 }}>{locale === 'pt' ? '🇧🇷' : '🇺🇸'}</Text>
        </Pressable>

        {/* Refresh */}
        <Pressable
          onPress={handleRefresh}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: `${BLUE}10`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.Text style={[{ fontSize: 16 }, { transform: [{ rotate: spin }] }]}>
            🔄
          </Animated.Text>
        </Pressable>

        {/* Avatar / logout */}
        <Pressable
          onPress={() => setShowUserMenu(true)}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? `${BLUE}30` : `${BLUE}18`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: `${BLUE}30`,
          })}
        >
          <Text style={{ fontSize: 16 }}>👤</Text>
        </Pressable>
      </View>

      {/* User menu modal */}
      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPress={() => setShowUserMenu(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 60,
              right: 12,
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 16,
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              gap: 12,
            }}
          >
            {/* Info do usuário */}
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>
                {user?.name ?? 'Usuário'}
              </Text>
              {(user?.email || user?.phone) && (
                <Text style={{ fontSize: 11, color: '#94a3b8' }} numberOfLines={1}>
                  {user.email ?? user.phone}
                </Text>
              )}
            </View>

            <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

            {/* Botão sair */}
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 8,
                paddingHorizontal: 4,
                borderRadius: 10,
                backgroundColor: pressed ? '#fef2f2' : 'transparent',
              })}
            >
              <Text style={{ fontSize: 18 }}>🚪</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#ef4444' }}>Sair da conta</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Seletor de município */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingBottom: 10 }}
      >
        {CITIES.map((c) => {
          const active = c.id === city.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCity(c)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: active ? BLUE : `${BLUE}10`,
                borderWidth: 1,
                borderColor: active ? BLUE : `${BLUE}28`,
                boxShadow: active ? '0 2px 8px rgba(0,119,182,0.25)' : undefined,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: active ? '#fff' : BLUE,
                }}
              >
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
