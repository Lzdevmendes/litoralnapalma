import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@litoral_na_palma:report_cooldown';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos entre reports

export async function canSubmitReport(): Promise<{ allowed: boolean; remainingMs: number }> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { allowed: true, remainingMs: 0 };
    const lastSubmit = parseInt(raw, 10);
    const elapsed = Date.now() - lastSubmit;
    if (elapsed >= COOLDOWN_MS) return { allowed: true, remainingMs: 0 };
    return { allowed: false, remainingMs: COOLDOWN_MS - elapsed };
  } catch {
    return { allowed: true, remainingMs: 0 };
  }
}

export async function recordReportSubmission(): Promise<void> {
  await AsyncStorage.setItem(KEY, String(Date.now()));
}

export function formatCooldown(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  return `${minutes} min`;
}
