/**
 * Serviço de notificações locais.
 * Usa require() condicional para NÃO carregar expo-notifications no Expo Go,
 * eliminando o ERROR "Android Push notifications removed from Expo Go SDK 53+".
 */
import { AppState } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as unknown as { appOwnership?: string }).appOwnership === 'expo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require('expo-notifications');
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
    // não disponível nesse ambiente
  }
}

/** Solicita permissão de notificação ao usuário. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

interface LocalNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  delaySeconds?: number;
}

/**
 * Envia notificação local imediata (ou com atraso).
 * Silencioso quando o app está em foreground ou no Expo Go.
 */
export async function sendLocalNotification(
  options: LocalNotificationOptions,
  force = false,
): Promise<string | null> {
  if (!Notifications) return null;
  const isForegrounded = AppState.currentState === 'active';
  if (isForegrounded && !force) return null;

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data ?? {},
      },
      trigger: options.delaySeconds
        ? {
            type: Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL ?? 'timeInterval',
            seconds: options.delaySeconds,
            repeats: false,
          }
        : null,
    });
  } catch {
    return null;
  }
}

/** Cancela todas as notificações agendadas. */
export async function cancelAllNotifications(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch { /* ignora */ }
}
