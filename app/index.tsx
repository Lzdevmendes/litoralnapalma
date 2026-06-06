import { useEffect, useState, useCallback, useRef } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCity } from '@/context/city-context';
import { useAuth } from '@/context/auth-context';
import { useUserMode } from '@/context/user-mode-context';
import { Header } from '@/components/dashboard/header';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { WeatherCard } from '@/components/dashboard/weather-card';
import { TrafficCard } from '@/components/dashboard/traffic-card';
import { BeachCard } from '@/components/dashboard/beach-card';
import { UPACard } from '@/components/dashboard/upa-card';
import { FerryCard } from '@/components/dashboard/ferry-card';
import { GasCard } from '@/components/dashboard/gas-card';
import { BusCard } from '@/components/dashboard/bus-card';
import { RestaurantCard } from '@/components/dashboard/restaurant-card';
import { AttractionCard } from '@/components/dashboard/attraction-card';
import { ModeContent } from '@/components/dashboard/mode-content';
import { AppMapView } from '@/components/map/map-view';
import { SmartRouter } from '@/components/router/smart-router';
import { ReportButton } from '@/components/report/report-button';
import { GeofenceAlert } from '@/components/geofencing/geofence-alert';
import { LocationConsent } from '@/components/ui/location-consent';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/context/language-context';

const ONBOARDING_KEY = '@litoral_na_palma:onboarding_done';
const BG = '#f0f6fc';

export default function DashboardScreen() {
  const { user, isLoading } = useAuth();
  const { mode } = useUserMode();
  const { city } = useCity();
  const { t } = useLanguage();

  const [onboardingReady, setOnboardingReady] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { consentState, requestConsent, denyConsent } = useGeolocation();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const registerSection = useCallback((key: string, y: number) => {
    sectionOffsets.current[key] = y;
  }, []);

  const scrollToSection = useCallback((key: string) => {
    const y = sectionOffsets.current[key];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(y - 8, 0), animated: true });
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setSeenOnboarding(!!v);
      setOnboardingReady(true);
    });
  }, []);

  // Aguarda sessão Supabase e leitura do AsyncStorage
  if (isLoading || !onboardingReady) return null;

  // Não autenticado → login primeiro
  if (!user) return <Redirect href="/auth/login" />;

  // Logado mas ainda não fez onboarding nesta sessão → onboarding obrigatório
  if (!seenOnboarding) return <Redirect href="/onboarding" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <LocationConsent
        visible={consentState === 'pending'}
        onAllow={requestConsent}
        onDeny={denyConsent}
      />
      <Header />
      <GeofenceAlert />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0077b6"
            colors={['#0077b6']}
          />
        }
      >
        <View style={{ paddingTop: 16 }}>
          <QuickStats onStatPress={scrollToSection} />
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <SmartRouter />
          {mode === 'morador' && <ModeContent mode={mode} />}

          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.map}</SectionTitle>
            <AppMapView />
          </View>

          <View style={{ gap: 6 }} onLayout={(e) => registerSection('weather', e.nativeEvent.layout.y)}>
            <SectionTitle>{t.sections.weather}</SectionTitle>
            <WeatherCard />
          </View>

          <View style={{ gap: 6 }} onLayout={(e) => registerSection('traffic', e.nativeEvent.layout.y)}>
            <SectionTitle>{t.sections.traffic}</SectionTitle>
            <TrafficCard />
          </View>

          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.gas}</SectionTitle>
            <GasCard />
          </View>

          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.bus}</SectionTitle>
            <BusCard />
          </View>

          {(city.id === 'ilhabela' || city.id === 'sao-sebastiao') && (
            <View style={{ gap: 6 }}>
              <SectionTitle>{t.sections.ferry}</SectionTitle>
              <FerryCard />
            </View>
          )}

          <View style={{ gap: 6 }} onLayout={(e) => registerSection('beaches', e.nativeEvent.layout.y)}>
            <SectionTitle>{t.sections.beaches}</SectionTitle>
            <BeachCard />
          </View>

          <View style={{ gap: 6 }} onLayout={(e) => registerSection('health', e.nativeEvent.layout.y)}>
            <SectionTitle>{t.sections.health}</SectionTitle>
            <UPACard />
          </View>

          {mode === 'turista' && (
            <>
              <View style={{ gap: 6 }}>
                <SectionTitle>{t.sections.restaurants}</SectionTitle>
                <RestaurantCard />
              </View>
              <View style={{ gap: 6 }}>
                <SectionTitle>{t.sections.attractions}</SectionTitle>
                <AttractionCard />
              </View>
            </>
          )}

          <Text
            style={{
              textAlign: 'center',
              fontSize: 10,
              color: '#94a3b8',
              paddingTop: 4,
              paddingBottom: 8,
            }}
          >
            Litoral na Palma · {city.name} · {t.footer}
          </Text>
        </View>
      </ScrollView>

      <ReportButton />
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 }}>
      <View style={{ width: 3, height: 12, borderRadius: 2, backgroundColor: '#0077b6' }} />
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {children}
      </Text>
    </View>
  );
}
