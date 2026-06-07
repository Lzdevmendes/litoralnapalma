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
  dashboard/           # Cards: weather, traffic, beach, upa, ferry, gas, bus, parking, restaurant, attraction
  geofencing/          # GeofenceAlert — alertas por distância GPS
  map/                 # map-view.tsx (nativo ou WebView), webview-map.tsx
  report/              # ReportButton, ReportModal (3 etapas + Leaflet picker)
  router/              # SmartRouter — sugestão de rotas por cidade (usa city.sideRoutes)
  ui/                  # Badge, ProgressBar, Skeleton, ErrorCard, ErrorBoundary, AvatarPicker
context/
  auth-context.tsx     # AuthUser em SecureStore; escuta onAuthStateChange do Supabase
  city-context.tsx     # Cidade selecionada (AsyncStorage)
  language-context.tsx # Locale pt/en (AsyncStorage)
  user-mode-context.tsx# morador ou turista (AsyncStorage)
hooks/
  useWeather.ts        # OWM API ou estimativa, refetch 5min
  useTraffic.ts        # Google Routes API ou estimativa, refetch 5min
  useBeaches.ts        # estimativa dinâmica, refetch 3min
  useWaterQuality.ts   # CETESB ArcGIS (pública), staleTime 24h
  useUPA.ts            # estimativa, refetch 3min
  useFerry.ts          # estimativa, refetch 10min
  useGasStations.ts    # estático de cities.ts, staleTime 6h
  useBusLines.ts       # estático + computeTimes() dinâmico, refetch 1min
  useReports.ts        # Supabase ou estimativa, refetch 60s
  useParkingZones.ts   # API Zona Azul ou estimativa por horário, refetch 2min
  useAttractions.ts    # estático de cities.ts
  useRestaurants.ts    # estático de cities.ts
  useGeolocation.ts    # expo-location foreground, watchPosition 50m/30s
  useNotifications.ts  # solicita permissão + listener de resposta
  useAvatar.ts         # avatar emoji do usuário (AsyncStorage), 12 opções temáticas
lib/
  api.ts               # Orquestra: decide API real vs estimativa para cada serviço
  auth.ts              # OTP email/phone, verifyOTP, signUpWith*, signOut
  cetesb.ts            # Fetch CETESB ArcGIS → mapeia para beachId interno
  i18n.ts              # Dicionário PT/EN (as const), tipo Translations
  notifications.ts     # sendLocalNotification, requestNotificationPermission
  reports.ts           # CRUD Supabase: fetchReports, submitReport, upvoteReport
  supabase.ts          # createClient com AsyncStorage como session adapter
  traffic.ts           # Google Routes API → TrafficLevel
  zonaazul.ts          # API Zona Azul → ParkingZone[] (fallback por horário)
  types.ts             # TrafficRoute, Beach, UPA, Report, FerryStatus, WeatherData, ParkingZone, AuthUser
  utils.ts             # trafficLevelColor, occupancyColor, formatWaitTime, timeAgo, haversine
data/
  cities.ts            # CITIES: array estático — praias, UPAs, rodovias, postos, ônibus, restaurantes, atrações,
                       #          sideRoutes (SmartRouter). Define também SideRoute interface (não em types.ts)
  mock.ts              # Generators: estimativas dinâmicas para Weather/Traffic/Beaches/UPAs/Ferry/Reports/Parking
docs/
  cities/              # Documentação por cidade: coordenadas, fontes de dados, quando atualizar cada campo
```

## Arquitetura API real vs estimativa

```
Dado           | Condição real                            | Sem chave / fallback
---------------|------------------------------------------|----------------------------
Clima          | EXPO_PUBLIC_OPENWEATHER_KEY              | estimativa por região
Trânsito       | EXPO_PUBLIC_GOOGLE_ROUTES_KEY            | estimativa ponderada
Reports        | EXPO_PUBLIC_SUPABASE_URL + KEY           | memória local (sessão)
Balneabilidade | API pública CETESB (sem chave)           | Lança erro → error state
Auth OTP       | EXPO_PUBLIC_SUPABASE_URL + KEY           | DEV_OTP='000000' aceito
Zona Azul      | EXPO_PUBLIC_ZONA_AZUL_API_KEY + BASE     | estimativa por hora do dia
Balsa          | (sem API pública disponível)             | estimativa por hora/dia
Praias dinâm.  | (sem API pública disponível)             | estimativa de ocupação
UPA dinâmica   | (sem API pública disponível)             | estimativa de tempo de espera
```

**Fronteira real↔estimativa em `lib/api.ts`** — ponto único de decisão para a maioria dos serviços. `lib/cetesb.ts`, `lib/traffic.ts` e `lib/zonaazul.ts` têm a decisão internamente.

## Zona Azul — integração

`lib/zonaazul.ts` gerencia a ocupação das vagas regulamentadas:
- **Com `EXPO_PUBLIC_ZONA_AZUL_API_KEY`**: consome API municipal (contrato com prefeitura), mescla dados dinâmicos (`availableSpots`, `updatedAt`) com dados estáticos de `cities.ts`
- **Sem chave**: `getMockParkingZones()` em `data/mock.ts` estima disponibilidade com base na hora do dia (pico 10h–18h = 75% das vagas ocupadas; fora de pico = 35%)

Zonas cadastradas por cidade em `data/cities.ts → City.parkingZones`:
- Caraguatatuba: 3 zonas (170 vagas total)
- São Sebastião: 3 zonas (210 vagas total)
- Ubatuba: 3 zonas (180 vagas total)
- Ilhabela: 2 zonas (130 vagas total)

## Mapa WebView (Expo Go)

Dois componentes usam Leaflet via CDN (`unpkg.com`) em uma WebView:
- `components/map/webview-map.tsx` — mapa principal do dashboard
- `components/report/report-modal.tsx` — picker de localização na etapa 2 do reporte

**Configuração obrigatória em ambos (qualquer WebView com HTML inline + recursos externos):**
- `source={{ html, baseUrl: 'https://unpkg.com' }}` — define a origin; sem isso o carregamento de CSS/JS externos falha com null origin
- `allowFileAccess` + `allowUniversalAccessFromFileURLs` — compatibilidade Android/iOS
- SRI (`integrity`/`crossorigin`) **removido intencionalmente** — CORS/SRI bloqueiam recursos externos com null origin no WebView nativo

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
- **i18n**: toda string visível ao usuário deve estar em `lib/i18n.ts`; usar `useLanguage()` em todos os componentes/telas; nunca `locale === 'pt' ? '...' : '...'` inline para strings de UI
- **URLs de localização**: usar `mapsNavigationUrl(lat, lng, name)` para botões "Como chegar"; campo `mapsUrl` em `cities.ts` deve usar formato `https://maps.google.com/?q=Nome,+Cidade,+SP&ll=lat,lng` — nunca coordenada crua `?q=lat,lng`
- **Regex Hermes-safe**: nunca usar combining chars raw em regex (`/[̀-ͯ]/g`); usar escapes explícitos (`/[̀-ͯ]/g`)

## Hooks de autenticação — fluxo completo

```
Cadastro:  signUpWithEmail/Phone(name, contact) → OTP enviado → verifyOTP → AuthUser
Login:     sendEmailOTP/sendPhoneOTP(contact)   → OTP enviado → verifyOTP → AuthUser
Dev:       qualquer OTP, DEV_OTP='000000' aceito em verifyOTP
Google:    signInWithGoogle() → não implementado em produção (requer expo-auth-session)
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

## Features implementadas (estado atual — junho 2026)

- **Dashboard**: Weather (visual responsivo ao clima), Traffic (rodovia em destaque), Beaches, UPA, Ferry, Gas, Bus, Restaurant, Attraction, Map (WebView com legenda i18n + upvote inline)
- **Smart Router**: sugestões por cidade via `city.sideRoutes` (4 locais reais por cidade), clicável
- **Modo morador/turista**: fixo após onboarding; troca só em Settings
- **Avatar**: galeria de 12 emojis praiano — persiste em AsyncStorage, exibido no header
- **Onboarding**: 3 slides animados — 4 cidades cobertas, preview por modo, botão "Próximo"
- **OTP verify**: animação shake no erro, checkmark verde no sucesso
- **i18n**: 100% PT/EN em todas as telas e componentes
- **Localização**: todas as URLs de mapas usam nome + coordenadas como âncora
- **Reportes**: upvote direto no popup do mapa via bridge WebView→RN
- **Dados**: 4 cidades — 21+ linhas de ônibus, 6 restaurantes verificados, 4 atrações, preços ANP mar/2026

## TODOs

- `signInWithGoogle` — requer expo-auth-session + Supabase OAuth
- `NSLocationAlwaysUsageDescription` em `app.config.ts` — presente mas app só solicita foreground permission; remover para evitar rejeição na App Store
- Sessão Supabase usa `LargeSecureStore` (tokens) mas `AsyncStorage` para metadados leves — aceitável por ora
- Edge functions sem validação de HMAC do Hook Secret — adicionar verificação de assinatura
- API DER-SP (balsa) — nenhuma API pública mapeada ainda
- Coordenadas de restaurantes e postos são aproximadas — verificar no Google Maps antes de publicar na App Store
- Linhas de ônibus precisam verificação nos sites EMTU/Litorânea/Pássaro Marron (horários podem ter mudado)
