/**
 * Serviço de notificações locais.
 * Usa require() condicional para NÃO carregar expo-notifications no Expo Go,
 * eliminando o ERROR "Android Push notifications removed from Expo Go SDK 53+".
 */
import { AppState, Platform } from 'react-native';
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

    // Android 8+ requer canais registrados — sem canal a notificação não aparece
    if (Platform.OS === 'android') {
      const imp = Notifications.AndroidImportance;
      [
        { id: 'beach-alert',      name: 'Alertas de Praia',       importance: imp?.HIGH    ?? 4, color: '#0077b6' },
        { id: 'traffic-alert',    name: 'Alertas de Trânsito',    importance: imp?.HIGH    ?? 4, color: '#f59e0b' },
        { id: 'community-report', name: 'Reportes da Comunidade', importance: imp?.DEFAULT ?? 3, color: '#ef4444' },
        { id: 'general',          name: 'Litoral na Palma',       importance: imp?.DEFAULT ?? 3, color: '#0077b6' },
      ].forEach(({ id, name, importance, color }) => {
        Notifications.setNotificationChannelAsync(id, {
          name,
          importance,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: color,
        }).catch(() => {});
      });
    }
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
  type?: 'beach' | 'traffic' | 'report' | 'general';
  locale?: 'pt' | 'en';
  data?: Record<string, unknown>;
  delaySeconds?: number;
}

const NOTIFICATION_TEMPLATE: Record<
  'beach' | 'traffic' | 'report' | 'general',
  { prefix: { pt: string; en: string }; category: string }
> = {
  beach:   { prefix: { pt: 'Praia',         en: 'Beach'     }, category: 'beach-alert'     },
  traffic: { prefix: { pt: 'Trânsito',      en: 'Traffic'   }, category: 'traffic-alert'   },
  report:  { prefix: { pt: 'Comunidade',    en: 'Community' }, category: 'community-report' },
  general: { prefix: { pt: 'Litoral na Palma', en: 'Litoral na Palma' }, category: 'general' },
};

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
    const template = NOTIFICATION_TEMPLATE[options.type ?? 'general'];
    const prefix = template.prefix[options.locale ?? 'pt'];
    const title = options.title.includes(prefix)
      ? options.title
      : `${prefix} · ${options.title}`;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        subtitle: prefix,
        body: options.body,
        data: { ...(options.data ?? {}), type: options.type ?? 'general' },
        categoryIdentifier: template.category,
        sound: true,
        // Android 8+: channelId deve referenciar um canal registrado acima
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(Platform.OS === 'android' ? { channelId: template.category } : {}) as any,
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
