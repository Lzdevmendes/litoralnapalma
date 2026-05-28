/**
 * Hook que inicializa as notificações: pede permissão e registra listener
 * de resposta (usuário tocou em uma notificação).
 *
 * Deve ser chamado UMA vez no _layout raiz via <NotificationSetup />.
 */
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { requestNotificationPermission } from '@/lib/notifications';

export function useNotifications() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Solicita permissão na primeira montagem (não bloqueia — se negada, tudo funciona).
    requestNotificationPermission().catch(() => {});

    // Listener para quando o usuário toca numa notificação (app em background/fechado).
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;

      // Navegação a partir de dados da notificação.
      if (data?.route && typeof data.route === 'string') {
        router.push(data.route as `/${string}`);
      }
    });

    return () => {
      responseListener.current?.remove();
    };
  }, []);
}
