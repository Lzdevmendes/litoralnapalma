import { useState } from 'react';
import { ScrollView, View, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import type { UserMode } from '@/lib/types';
import { Header } from '@/components/dashboard/header';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { WeatherCard } from '@/components/dashboard/weather-card';
import { TrafficCard } from '@/components/dashboard/traffic-card';
import { BeachCard } from '@/components/dashboard/beach-card';
import { UPACard } from '@/components/dashboard/upa-card';
import { ModeContent } from '@/components/dashboard/mode-content';
import { AppMapView } from '@/components/map/map-view';
import { SmartRouter } from '@/components/router/smart-router';
import { ReportButton } from '@/components/report/report-button';
import { GeofenceAlert } from '@/components/geofencing/geofence-alert';

const BG = '#f0f6fc';

export default function DashboardScreen() {
  const [mode, setMode] = useState<UserMode>('morador');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sticky header */}
      <Header mode={mode} onModeChange={setMode} />

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
            <SectionTitle>🗺️ Mapa ao Vivo</SectionTitle>
            <AppMapView />
          </View>

          {/* Weather */}
          <View style={{ gap: 6 }}>
            <SectionTitle>🌤️ Clima</SectionTitle>
            <WeatherCard />
          </View>

          {/* Traffic */}
          <View style={{ gap: 6 }}>
            <SectionTitle>🚗 Trânsito</SectionTitle>
            <TrafficCard />
          </View>

          {/* Beaches */}
          <View style={{ gap: 6 }}>
            <SectionTitle>🏖️ Praias</SectionTitle>
            <BeachCard />
          </View>

          {/* UPAs */}
          <View style={{ gap: 6 }}>
            <SectionTitle>🏥 Saúde · UPAs</SectionTitle>
            <UPACard />
          </View>

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
            Litoral na Palma · Dados atualizados em tempo real · Litoral Norte SP
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
