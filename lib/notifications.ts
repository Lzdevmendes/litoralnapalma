/**
 * Serviço de notificações locais via expo-notifications.
 * Push tokens requerem dev build — aqui apenas notificações locais (Expo Go ✓).
 *
 * Nota: Expo Go exibe um aviso sobre push remotas removidas no SDK 53+.
 * Isso NÃO afeta notificações locais — é apenas informativo.
 */
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

// Exibe banners enquanto o app está em primeiro plano.
// O try-catch evita crash em ambientes onde o handler não é suportado.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // silencia em ambientes sem suporte completo (Expo Go antigo)
}

/** Solicita permissão de notificação ao usuário. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

interface LocalNotificationOptions {
  title: string;
  body: string;
  /** Dados extras acessíveis ao tratar a notificação. */
  data?: Record<string, unknown>;
  /** Atraso em segundos antes de exibir (padrão: imediato). */
  delaySeconds?: number;
}

/**
 * Envia uma notificação local imediata (ou com pequeno atraso).
 * Só dispara quando o app NÃO está em foreground para evitar spam visual
 * (banners continuam funcionando via setNotificationHandler, mas para
 * alertas operacionais — geofence, lotação — é melhor não duplicar com UI).
 *
 * Passe `force: true` para enviar independente do estado do app.
 */
export async function sendLocalNotification(
  options: LocalNotificationOptions,
  force = false,
): Promise<string | null> {
  const isForegrounded = AppState.currentState === 'active';
  if (isForegrounded && !force) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data ?? {},
      },
      trigger: options.delaySeconds
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: options.delaySeconds, repeats: false }
        : null,
    });
    return id;
  } catch {
    return null;
  }
}

/** Cancela todas as notificações agendadas pendentes. */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
