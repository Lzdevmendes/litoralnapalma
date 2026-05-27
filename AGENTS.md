# Litoral na Palma — Guia do Agente

Este é um app **React Native / Expo** (não Next.js).

## Stack

- **Expo SDK 54** + **Expo Router ~6.0.23** (file-based routing)
- **React Native 0.81.5** com New Architecture habilitada
- **React 19.1.0**
- **TanStack Query v5** para data fetching
- **react-native-maps** para mapas (requer dev build — não funciona no Expo Go)
- **expo-blur**, **expo-haptics**, **expo-location**, **expo-notifications**
- **pnpm** como gerenciador de pacotes

## Estrutura

```
app/           # Rotas (Expo Router)
components/    # Componentes UI reutilizáveis
  dashboard/   # Cards do dashboard
  geofencing/  # Alertas em tempo real
  map/         # MapView
  report/      # Modal de reporte
  router/      # Smart Router
  ui/          # Primitivos (Badge, ProgressBar, Skeleton, GlassCard)
hooks/         # Custom hooks (useWeather, useBeaches, useTraffic, useUPA, useReports)
lib/           # Tipos, utils, api
data/          # Mock data (TODO: substituir por APIs reais)
```

## Regras

- Inline styles — **sem** Tailwind, CSS ou StyleSheet.create
- Aliases: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/data/*`
- Commits: `feat:`, `chore:`, `fix:`, `refactor:` — somente título, sem body
- `boxShadow` via CSS string (New Arch): `{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }`
- `process.env.EXPO_OS` em vez de `Platform.OS`
- `expo-image` para SF Symbols (iOS) e imagens
- `react-native-safe-area-context` — nunca o SafeAreaView do React Native

## Rodar localmente

```bash
pnpm start              # Expo Go (sem mapa — react-native-maps não suportado)
npx expo run:android    # Dev build com mapa (requer Android SDK)
npx expo run:ios        # Dev build com mapa (requer Xcode)
```
