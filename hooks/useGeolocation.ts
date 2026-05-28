import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export interface UserCoords {
  lat: number;
  lng: number;
  accuracy: number | null;
}

interface GeolocationState {
  coords: UserCoords | null;
  permissionDenied: boolean;
  isLoading: boolean;
}

/**
 * Hook de geolocalização contínua via expo-location.
 * - Solicita permissão com UX não-bloqueante (fallback gracioso se negado)
 * - Atualiza a cada 50m ou 30s
 * - Retorna null em coords quando sem permissão ou aguardando
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    permissionDenied: false,
    isLoading: true,
  });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setState({ coords: null, permissionDenied: true, isLoading: false });
        return;
      }

      // Posição inicial rápida
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({
            coords: {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              accuracy: loc.coords.accuracy,
            },
            permissionDenied: false,
            isLoading: false,
          });
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
      }

      // Atualizações contínuas
      try {
        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 50,   // metros
            timeInterval: 30_000,   // ms
          },
          (loc) => {
            if (!cancelled) {
              setState({
                coords: {
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude,
                  accuracy: loc.coords.accuracy,
                },
                permissionDenied: false,
                isLoading: false,
              });
            }
          }
        );
      } catch {
        // watchPositionAsync pode falhar em emuladores sem sensor
      }
    }

    start().catch(() => setState((s) => ({ ...s, isLoading: false })));

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
    };
  }, []);

  return state;
}
