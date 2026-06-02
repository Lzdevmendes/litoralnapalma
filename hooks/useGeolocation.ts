import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserCoords {
  lat: number;
  lng: number;
  accuracy: number | null;
}

export type ConsentState = 'pending' | 'granted' | 'denied';

interface GeolocationState {
  coords: UserCoords | null;
  permissionDenied: boolean;
  isLoading: boolean;
  consentState: ConsentState;
  requestConsent: () => void;
  denyConsent: () => void;
}

const CONSENT_KEY = '@litoral_na_palma:location_consent';

async function loadConsent(): Promise<ConsentState | null> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (raw === 'granted' || raw === 'denied') return raw;
    return null;
  } catch {
    return null;
  }
}

async function saveConsent(state: 'granted' | 'denied'): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, state);
}

/**
 * Hook de geolocalização com pré-consentimento LGPD.
 * - Mostra modal de explicação antes de solicitar permissão do sistema
 * - Respeita decisão prévia armazenada em AsyncStorage
 * - Atualiza posição a cada 50m ou 30s (foreground only)
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    permissionDenied: false,
    isLoading: false,
    consentState: 'pending',
    requestConsent: () => {},
    denyConsent: () => {},
  });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const consentRef = useRef<ConsentState>('pending');

  useEffect(() => {
    loadConsent().then((saved) => {
      if (saved === 'granted') {
        startTracking();
      } else if (saved === 'denied') {
        updateConsent('denied');
      } else {
        // Mostra modal — consentState fica 'pending', UI exibe LocationConsent
        setState((s) => ({ ...s, consentState: 'pending' }));
      }
    });
    return () => {
      subscriptionRef.current?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateConsent(next: ConsentState) {
    consentRef.current = next;
    setState((s) => ({ ...s, consentState: next }));
  }

  async function startTracking() {
    updateConsent('granted');
    saveConsent('granted').catch(() => {});
    setState((s) => ({ ...s, isLoading: true }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setState((s) => ({ ...s, permissionDenied: true, isLoading: false, consentState: 'denied' }));
      saveConsent('denied').catch(() => {});
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setState((s) => ({
        ...s,
        coords: { lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy },
        isLoading: false,
      }));
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }

    try {
      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50, timeInterval: 30_000 },
        (loc) => {
          setState((s) => ({
            ...s,
            coords: { lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy },
          }));
        },
      );
    } catch {
      // watchPositionAsync pode falhar em emuladores sem sensor
    }
  }

  function requestConsent() {
    startTracking().catch(() => setState((s) => ({ ...s, isLoading: false })));
  }

  function denyConsent() {
    updateConsent('denied');
    saveConsent('denied').catch(() => {});
  }

  return { ...state, requestConsent, denyConsent };
}
