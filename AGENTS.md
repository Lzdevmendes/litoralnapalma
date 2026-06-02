# Litoral na Palma — Guia do Agente

Este é um app **React Native / Expo** (não Next.js, não web puro).

## Stack

- **Expo SDK 54** + **Expo Router ~6.0.24** (file-based routing)
- **React Native 0.81.5** com New Architecture habilitada
- **React 19.1.0**
- **TanStack Query v5** para data fetching e cache
- **react-native-maps** para mapas (requer dev build — não funciona no Expo Go)
- **Leaflet/WebView** para mapa no Expo Go e picker de reporte
- **expo-blur**, **expo-haptics**, **expo-location** (foreground), **expo-notifications**, **expo-secure-store**
- **Supabase** (@supabase/supabase-js v2) para auth OTP + banco de reports
- **pnpm** como gerenciador de pacotes

## Estrutura

```
app/
  _layout.tsx          # Root: providers (QueryClient, Auth, Language, City, UserMode)
  index.tsx            # Dashboard + guards de auth/onboarding
  onboarding.tsx       # Escolha de modo morador/turista
  auth/                # login.tsx, register.tsx, verify.tsx
  praia/[id].tsx       # Detalhe de praia
  posto/[id].tsx       # Detalhe de posto
components/
  dashboard/           # Cards: weather, traffic, beach, upa, ferry, gas, bus, restaurant, attraction
  geofencing/          # GeofenceAlert — alertas por distância GPS
  map/                 # map-view.tsx (nativo ou WebView), webview-map.tsx
  report/              # ReportButton, ReportModal (3 etapas + Leaflet picker)
  router/              # SmartRouter — sugestão de rotas alternativas
  ui/                  # Badge, ProgressBar, Skeleton, ErrorCard, ErrorBoundary
context/
  auth-context.tsx     # AuthUser em SecureStore; escuta onAuthStateChange do Supabase
  city-context.tsx     # Cidade selecionada (AsyncStorage)
  language-context.tsx # Locale pt/en (AsyncStorage)
  user-mode-context.tsx# morador ou turista (AsyncStorage)
hooks/
  useWeather.ts        # OWM API ou mock, refetch 5min
  useTraffic.ts        # Google Routes API ou mock, refetch 5min
  useBeaches.ts        # mock (ocupação dinâmica), refetch 3min
  useWaterQuality.ts   # CETESB ArcGIS (pública), staleTime 24h
  useUPA.ts            # mock, refetch 3min
  useFerry.ts          # mock, refetch 10min (TODO: API DER-SP)
  useGasStations.ts    # estático de cities.ts, staleTime 6h
  useBusLines.ts       # estático + computeTimes() dinâmico, refetch 1min
  useReports.ts        # Supabase ou mock, refetch 60s
  useAttractions.ts    # estático de cities.ts
  useRestaurants.ts    # estático de cities.ts
  useGeolocation.ts    # expo-location foreground, watchPosition 50m/30s
  useNotifications.ts  # solicita permissão + listener de resposta
lib/
  api.ts               # Orquestra: decide mock vs real para cada serviço
  auth.ts              # OTP email/phone, verifyOTP, signUpWith*, signOut
  cetesb.ts            # Fetch CETESB ArcGIS → mapeia para beachId interno
  i18n.ts              # Dicionário PT/EN (as const), tipo Translations
  notifications.ts     # sendLocalNotification, requestNotificationPermission
  reports.ts           # CRUD Supabase: fetchReports, submitReport, upvoteReport
  supabase.ts          # createClient com AsyncStorage como session adapter
  traffic.ts           # Google Routes API → TrafficLevel
  types.ts             # TrafficRoute, Beach, UPA, Report, FerryStatus, WeatherData, AuthUser
  utils.ts             # trafficLevelColor, occupancyColor, formatWaitTime, timeAgo, haversine
data/
  cities.ts            # CITIES: array estático com praias, UPAs, rodovias, postos, ônibus, etc.
  mock.ts              # Generators: getMockWeather/Traffic/Beaches/UPAs/Ferry/Reports
```

## Arquitetura mock vs real

```
Dado         | Condição real                    | Fallback
-------------|----------------------------------|----------------------------
Clima        | EXPO_PUBLIC_OPENWEATHER_KEY      | getMockWeather()
Trânsito     | EXPO_PUBLIC_GOOGLE_ROUTES_KEY    | getMockTraffic()
Reports      | EXPO_PUBLIC_SUPABASE_URL + KEY   | getMockReports()
Balneabilidade| (API pública CETESB, sem chave) | Lança erro → React Query error state
Auth OTP     | EXPO_PUBLIC_SUPABASE_URL + KEY   | DEV_OTP='000000' aceito
Balsa        | SEMPRE MOCK                      | getMockFerry()
Praias dinâm.| SEMPRE MOCK                      | getMockBeaches()
UPA dinâmica | SEMPRE MOCK                      | getMockUPAs()
```

**Fronteira mock↔real em `lib/api.ts`** — ponto único de decisão para a maioria dos serviços. `lib/cetesb.ts` e `lib/traffic.ts` têm a decisão internamente.

## Supabase — segurança (RLS obrigatório)

O Supabase `anon key` é embarcado no app (EXPO_PUBLIC_*) e visível a qualquer um. Isso é esperado pelo design do Supabase, **mas exige RLS ativo em todas as tabelas**.

Tabelas existentes:
- `reports` — deve ter RLS: SELECT filtrado por cidade, INSERT permitido a qualquer anon, UPDATE/DELETE negado a anon
- `report_upvotes` — deve ter `UNIQUE (device_id, report_id)` para impedir duplo-voto server-side

Sem RLS em `reports`: qualquer pessoa pode ler, inserir, atualizar ou deletar todos os reportes via API REST direta.

## Convenções

- **Inline styles** — sem Tailwind, CSS ou StyleSheet.create; boxShadow como string CSS: `{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }`
- **Aliases**: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/data/*`, `@/context/*`
- **Commits**: `feat:`, `chore:`, `fix:`, `refactor:` — somente título, sem body
- **OS detection**: `process.env.EXPO_OS` em vez de `Platform.OS`
- **Imagens**: `expo-image` para SF Symbols (iOS) e imagens otimizadas
- **SafeArea**: `react-native-safe-area-context` — nunca o SafeAreaView do React Native core
- **Query keys**: `[nomeServiço, city.id]` para dados por cidade; sem cidade para dados globais (ex: `["water-quality"]`)
- **Hooks React Query**: staleTime e refetchInterval devem estar alinhados — staleTime ≤ refetchInterval

## Hooks de autenticação — fluxo completo

```
Cadastro:  signUpWithEmail/Phone(name, contact) → OTP enviado → verifyOTP → AuthUser
Login:     sendEmailOTP/sendPhoneOTP(contact)   → OTP enviado → verifyOTP → AuthUser
Dev/mock:  qualquer OTP, DEV_OTP='000000' aceito em verifyOTP
Google:    signInWithGoogle() → MOCK hardcoded (não implementado em produção)
```

`AuthContext` persiste `AuthUser` em SecureStore e escuta `onAuthStateChange` do Supabase para sincronizar tokens.

## Rodar localmente

```bash
pnpm start              # Expo Go (mapa via Leaflet/WebView, sem react-native-maps)
npx expo run:android    # Dev build com react-native-maps (requer Android SDK)
npx expo run:ios        # Dev build com react-native-maps (requer Xcode)
pnpm test               # Jest — 97 testes (lib + hooks)
npx tsc --noEmit        # Type check
```

## Edge Functions (Supabase)

| Função | Trigger | Serviço |
|---|---|---|
| `send-auth-email` | Auth Hook → Custom Email Sender | Resend API |
| `send-auth-sms` | Auth Hook → Custom SMS Sender | Infobip API |

### Configurar hooks

1. **Supabase Dashboard → Authentication → Auth Hooks**
2. Adicionar hook **"Custom Email Sender"**:
   - URL: `https://nkkaaopslozyisicyjne.supabase.co/functions/v1/send-auth-email`
   - Copiar o **Hook Secret** gerado
3. Adicionar hook **"Custom SMS Sender"**:
   - URL: `https://nkkaaopslozyisicyjne.supabase.co/functions/v1/send-auth-sms`
   - Copiar o **Hook Secret** gerado

### Secrets das funções

```bash
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set RESEND_FROM="Litoral na Palma <noreply@seudominio.com.br>"
supabase secrets set SEND_EMAIL_HOOK_SECRET=<copiado acima>
supabase secrets set INFOBIP_API_KEY=...
supabase secrets set INFOBIP_BASE_URL=xxxx.api.infobip.com
supabase secrets set SEND_SMS_HOOK_SECRET=<copiado acima>
```

> **Resend sem domínio:** use `noreply@resend.dev` para testes.
> **Infobip:** conta gratuita com 60 dias de trial.

## Problemas conhecidos / TODOs

- `useFerry` — sempre mock; API DER-SP ainda não mapeada
- `signInWithGoogle` — mock hardcoded; requer expo-auth-session + Supabase OAuth
- `submitReportToSupabase` — sem validação de tamanho máximo de description no client
- `NSLocationAlwaysUsageDescription` em `app.config.ts` — presente mas app só solicita foreground permission; remover para evitar rejeição na App Store
- Sessão Supabase em `AsyncStorage` — não criptografado; migrar para LargeSecureStore em versão futura
- Edge functions sem validação de HMAC do Hook Secret — adicionar verificação de assinatura
