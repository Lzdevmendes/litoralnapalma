import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
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

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setSeenOnboarding(!!v);
      setOnboardingReady(true);
    });
  }, []);

  // Aguarda carregamento de auth e verificação do onboarding
  if (!onboardingReady || isLoading) return null;

  // Redireciona para onboarding na primeira vez
  if (!seenOnboarding) return <Redirect href="/onboarding" />;

  // Redireciona para login se não autenticado
  if (!user) return <Redirect href="/auth/login" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sticky header */}
      <Header />

      {/* Floating alerts */}
      <GeofenceAlert />

      <ScrollView
        contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick stats strip */}
        <View style={{ paddingTop: 16 }}>
          <QuickStats />
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          {/* Smart router — conditional */}
          <SmartRouter />

          {/* Mode-specific content */}
          <ModeContent mode={mode} />

          {/* Map */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.map}</SectionTitle>
            <AppMapView />
          </View>

          {/* Weather */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.weather}</SectionTitle>
            <WeatherCard />
          </View>

          {/* Traffic */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.traffic}</SectionTitle>
            <TrafficCard />
          </View>

          {/* Gas stations */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.gas}</SectionTitle>
            <GasCard />
          </View>

          {/* Bus lines */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.bus}</SectionTitle>
            <BusCard />
          </View>

          {/* Ferry — apenas para Ilhabela e São Sebastião */}
          {(city.id === 'ilhabela' || city.id === 'sao-sebastiao') && (
            <View style={{ gap: 6 }}>
              <SectionTitle>{t.sections.ferry}</SectionTitle>
              <FerryCard />
            </View>
          )}

          {/* Beaches */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.beaches}</SectionTitle>
            <BeachCard />
          </View>

          {/* UPAs */}
          <View style={{ gap: 6 }}>
            <SectionTitle>{t.sections.health}</SectionTitle>
            <UPACard />
          </View>

          {/* Turista: restaurantes e atrações */}
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

          {/* Footer */}
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

      {/* Floating report button */}
      <ReportButton />
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', paddingHorizontal: 2 }}>
      {children}
    </Text>
  );
}
