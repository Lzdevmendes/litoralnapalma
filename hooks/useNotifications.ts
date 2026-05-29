/**
 * Hook que inicializa as notificações: pede permissão e registra listener
 * de resposta (usuário tocou em uma notificação).
 *
 * Guarda o import do expo-notifications — no Expo Go, push notifications
 * foram removidas no SDK 53 e o pacote loga um ERROR no console.
 * Local notifications ainda funcionam; o guard evita o aviso desnecessário.
 */
import { useEffect } from 'react';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { requestNotificationPermission } from '@/lib/notifications';

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as unknown as { appOwnership?: string }).appOwnership === 'expo';

export function useNotifications() {
  useEffect(() => {
    if (isExpoGo) return; // Push notifications não suportadas no Expo Go SDK 53+

    // Solicita permissão na primeira montagem.
    requestNotificationPermission().catch(() => {});

    // Listener para quando o usuário toca numa notificação (app em background/fechado).
    let subscription: { remove: () => void } | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications');
      subscription = Notifications.addNotificationResponseReceivedListener(
        (response: { notification: { request: { content: { data: Record<string, unknown> } } } }) => {
          const data = response.notification.request.content.data;
          if (data?.route && typeof data.route === 'string') {
            router.push(data.route as `/${string}`);
          }
        },
      );
    } catch { /* não disponível */ }

    return () => { subscription?.remove(); };
  }, []);
}
