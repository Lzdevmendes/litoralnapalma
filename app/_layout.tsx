import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { CityProvider } from '@/context/city-context';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { UserModeProvider } from '@/context/user-mode-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useNotifications } from '@/hooks/useNotifications';

/** Inicializa permissões e listeners de notificação. */
function NotificationSetup() {
  useNotifications();
  return null;
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LanguageProvider>
              <CityProvider>
                <UserModeProvider>
                  <NotificationSetup />
                  <StatusBar style="light" />
                  <Stack screenOptions={{ headerShown: false }} />
                </UserModeProvider>
              </CityProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
