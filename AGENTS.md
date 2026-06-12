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
  router/              # SmartRouter — sugestão de rotas por cidade (usa city.sideRoutes)
  ui/                  # Badge, ProgressBar, Skeleton, ErrorCard, ErrorBoundary, LocationConsent, AvatarPicker
context/
  auth-context.tsx     # AuthUser em SecureStore; escuta onAuthStateChange do Supabase
  city-context.tsx     # Cidade selecionada (AsyncStorage)
  language-context.tsx # Locale pt/en (AsyncStorage)
  user-mode-context.tsx# morador ou turista (AsyncStorage)
hooks/
  useWeather.ts        # OWM API ou estimativa, refetch 5min
  useTraffic.ts        # Google Routes API ou estimativa, refetch 5min
  useBeaches.ts        # estimativa dinâmica, refetch 3min
  useWaterQuality.ts   # CETESB ArcGIS (pública), staleTime 24h, refetchInterval 24h
  useUPA.ts            # estimativa, refetch 3min
  useFerry.ts          # estimativa, refetch 10min
  useGasStations.ts    # estático de cities.ts, staleTime 6h
  useBusLines.ts       # estático + computeTimes() dinâmico, refetch 1min
  useReports.ts        # Supabase ou estimativa, refetch 60s
  useAttractions.ts    # estático de cities.ts
  useRestaurants.ts    # estático de cities.ts
  useGeolocation.ts    # expo-location foreground, watchPosition 50m/30s, pré-consentimento LGPD
  useNotifications.ts  # solicita permissão + listener de resposta
  useAvatar.ts         # avatar emoji do usuário (AsyncStorage), 12 opções temáticas
lib/
  api.ts               # Orquestra: decide API real vs estimativa para cada serviço
  auth.ts              # OTP email/phone, verifyOTP, signUpWith*, signOut, signInWithGoogle
  cetesb.ts            # Fetch CETESB ArcGIS → mapeia para beachId interno
  design.ts            # Tokens de design (C/S/R/CARD_BASE) usados via inline styles em ~10 componentes
  i18n.ts              # Dicionário PT/EN (as const), tipo Translations
  large-secure-store.ts# Adapter chunked sobre expo-secure-store (contorna limite ~2KB/chave)
  notifications.ts     # sendLocalNotification, requestNotificationPermission
  report-rate-limit.ts # Cooldown client-side (AsyncStorage) entre reportes — camada de conveniência, não anti-abuso real
  reports.ts           # CRUD Supabase: fetchReports, submitReport, upvoteReport
  supabase.ts          # createClient com LargeSecureStore (SecureStore) como session adapter
  traffic.ts           # Google Routes API → TrafficLevel
  types.ts             # TrafficRoute, Beach, UPA, Report, FerryStatus, WeatherData, AuthUser
  utils.ts             # trafficLevelColor, occupancyColor, formatWaitTime, timeAgo, haversine, mapsNavigationUrl
data/
  cities.ts            # CITIES: array estático — praias, UPAs, rodovias, postos, ônibus, restaurantes, atrações,
                       #          sideRoutes (SmartRouter). Define também SideRoute interface (não em types.ts)
  mock.ts              # Generators: estimativas dinâmicas para Weather/Traffic/Beaches/UPAs/Ferry/Reports
docs/
  cities/              # Documentação por cidade: coordenadas, fontes de dados, quando atualizar cada campo
  EXPLICACAO.md        # Explicação didática: o que o app entrega, jornadas de usuário, papel de cada peça técnica
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
Balsa          | (sem API pública disponível)             | estimativa por hora/dia
Praias dinâm.  | (sem API pública disponível)             | estimativa de ocupação
UPA dinâmica   | (sem API pública disponível)             | estimativa de tempo de espera
```

> ⚠️ **"Zona Azul" não é uma feature do app** — não existe `lib/zonaazul.ts`, `useParkingZones`,
> `ParkingZone` nem `EXPO_PUBLIC_ZONA_AZUL_API_KEY` no código (confirmado por grep no repo inteiro e
> no histórico do git). Versões antigas deste arquivo e do `README.md` documentavam essa seção como
> se existisse — foi removida na auditoria de 2026-06 por descrever uma feature nunca implementada.
> Se for implementá-la de fato, esta seção deve voltar junto com o código.

**Fronteira real↔estimativa em `lib/api.ts`** — ponto único de decisão para a maioria dos serviços. `lib/cetesb.ts` e `lib/traffic.ts` têm a decisão internamente.

## Mapa WebView (Expo Go)

Três componentes usam Leaflet via CDN (`unpkg.com`) em uma WebView:
- `components/map/webview-map.tsx` — mapa principal do dashboard
- `components/report/report-modal.tsx` — picker de localização na etapa 2 do reporte
- `app/praia/[id].tsx` — mini-mapa na tela de detalhe de praia (`beachMiniMapHtml()`, circleMarker colorido por ocupação)

**Configuração obrigatória em ambos (qualquer WebView com HTML inline + recursos externos):**
- `source={{ html, baseUrl: 'https://unpkg.com' }}` — define a origin; sem isso o carregamento de CSS/JS externos falha com null origin
- `allowFileAccess` + `allowUniversalAccessFromFileURLs` — compatibilidade Android/iOS
- SRI (`integrity`/`crossorigin`) **removido intencionalmente** — CORS/SRI bloqueiam recursos externos com null origin no WebView nativo

## Supabase — segurança (RLS obrigatório, tolerância zero)

O Supabase `anon key` é embarcado no app (EXPO_PUBLIC_*) e visível a qualquer um. Isso é esperado pelo design do Supabase, **mas exige RLS ativo em todas as tabelas**.

**Estado real das policies (conferido diretamente no projeto via Supabase MCP — não é aspiracional):**

`profiles` (`rls_enabled: true`): SELECT/INSERT/UPDATE restritos a `auth.uid() = id` (cada um só vê/edita o próprio perfil).

`reports` (`rls_enabled: true`):
- `reports: public read` → SELECT com `expires_at > now()` — **sem filtro de cidade na policy**; o filtro
  por `city` é só uma cláusula `.eq()` que `lib/reports.ts:fetchReportsFromSupabase` aplica no cliente.
  Qualquer um pode ler reports de todas as cidades (não é vazamento de dado sensível, mas o texto antigo
  deste arquivo dizia "SELECT filtrado por cidade" — **isso nunca foi verdade na policy**).
- `reports: auth insert` → INSERT requer `auth.role() = 'authenticated'` — **anon não consegue inserir**.
  Isso só não quebra o fluxo porque `app/index.tsx:80` já redireciona usuários não-autenticados para
  `/auth/login` antes de qualquer tela com `ReportButton`.
- `reports: owner delete` → DELETE requer `auth.uid() = user_id`.
- **Não existe policy de UPDATE** — reports são efetivamente imutáveis via API (by design ou esquecimento — ❓ a confirmar com quem desenhou o schema).

`report_upvotes` (`rls_enabled: true`, PK composta `(report_id, user_id)`, FK para `auth.users`):
- `upvotes: auth insert` → `auth.uid() = user_id`; `upvotes: owner delete` → `auth.uid() = user_id`.

✅ **Gap de upvote corrigido** (migration `20260610215000` aplicada e verificada no Postgres):
`increment_report_upvote` agora valida `auth.uid()`, faz `insert into report_upvotes ... on conflict do nothing`,
só incrementa `reports.upvotes` se a linha foi inserida (rows_affected > 0), e retorna boolean.
`execute` revogado de `anon` — apenas `authenticated` pode chamar. `SET search_path = public` incluído.

Sem RLS em `reports`: qualquer pessoa poderia ler, inserir, atualizar ou deletar todos os reportes via API REST direta — esse cenário **não se aplica aqui** (RLS está ativo e correto na superfície), mas o gap de upvote acima tem o mesmo efeito prático sobre a integridade dos dados da comunidade.

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
Google:    signInWithGoogle() → implementado em lib/auth.ts:183-212 (expo-web-browser +
           signInWithOAuth + exchangeCodeForSession, com guarda isExpoGo). ❓ a confirmar:
           se já foi testado ponta-a-ponta em produção — não há teste cobrindo o fluxo OAuth.
```

`AuthContext` persiste `AuthUser` em SecureStore e escuta `onAuthStateChange` do Supabase para sincronizar tokens.

## Rodar localmente

```bash
pnpm start              # Expo Go (mapa via Leaflet/WebView, sem react-native-maps)
npx expo run:android    # Dev build com react-native-maps (requer Android SDK)
npx expo run:ios        # Dev build com react-native-maps (requer Xcode)
pnpm test               # Jest — 110 testes (lib + hooks)
npx tsc --noEmit        # Type check
```

> Web **não é uma plataforma suportada** — `react-native-web` não está em `dependencies`. O script
> `pnpm web` e a seção `web:` do `app.config.ts` foram **removidos** na limpeza de 2026-06.

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
- **Detalhe de praia** (`praia/[id].tsx`): mini-mapa Leaflet (WebView, funciona no Expo Go), dados CETESB
  mesclados via `useMemo` (`waterQuality` + `collectedAt`), barra de ocupação, infraestrutura, botão Como Chegar
- **Smart Router**: sugestões por cidade via `city.sideRoutes` (4 locais reais por cidade), clicável
- **Modo morador/turista**: fixo após onboarding; troca só em Settings
- **Avatar**: galeria de 12 emojis praiano — persiste em AsyncStorage, exibido no header
- **Onboarding**: 3 slides animados — 4 cidades cobertas, preview por modo, botão "Próximo"
- **OTP verify**: animação shake no erro, checkmark verde no sucesso
- **Notificações Android**: 4 canais registrados em `lib/notifications.ts` (`beach-alert`, `traffic-alert`,
  `community-report`, `general`) — obrigatório Android 8+; `channelId` incluído no conteúdo da notificação
- **i18n**: dicionário `lib/i18n.ts` cobre dashboard, auth, reportes, consentimento e alertas de geofence.
  Gap restante: `app/legal/{terms,privacy}.tsx` (só PT — aceitável para publicação inicial) e `app/onboarding.tsx` (usa `labelPt`/`labelEn` próprios)
- **Localização**: todas as URLs de mapas usam `mapsNavigationUrl()` com coordenadas exatas como âncora primária
  (corrigido o esquema `maps://` no iOS — `maps:` sem barras fazia o Apple Maps buscar a string ao invés de fixar o pino)
- **Reportes**: upvote direto no popup do mapa via bridge WebView→RN
- **Dados**: 4 cidades — UPAs verificadas via fontes oficiais (prefeitura, Santa Casa), 21+ linhas de ônibus,
  6 restaurantes verificados, 4 atrações, preços ANP mar/2026
- **CETESB**: `refetchInterval: 24h` ativo — dados de balneabilidade se atualizam diariamente enquanto o app está aberto

## TODOs

> Lista revisada na auditoria de 2026-06 — itens já resolvidos foram removidos (ver histórico do arquivo
> se precisar do contexto antigo) e novos achados (verificados em código e/ou direto no banco) foram
> adicionados com severidade.

**Estrutural — prioridade alta:**
- ~~🔴 `increment_report_upvote` não usava `report_upvotes`/RLS~~ — ✅ corrigido em `20260610215000`; verificado no Postgres (2026-06-12).
- ~~🔴 `useSubmitReport` não trata erro~~ — ✅ `onError` loga no hook; `ReportModal` exibe falha com retry liberado.
- ~~🟡 Notificações Android sem canal~~ — ✅ 4 canais registrados em `lib/notifications.ts`; `channelId` no conteúdo.
- ~~🟡 CETESB `refetchInterval: false`~~ — ✅ corrigido para `24h`; dados se atualizam diariamente.
- ~~🟡 Mapa ausente em `praia/[id].tsx`~~ — ✅ WebView Leaflet adicionado; CETESB mesclado via `useMemo`.
- ~~🟡 Dados de UPAs incorretos~~ — ✅ Caraguatatuba (3 UPAs), São Sebastião, Ubatuba verificados em fontes oficiais.
- 🟡 `EXPO_PUBLIC_GOOGLE_ROUTES_KEY` é usada direto no bundle JS (`lib/traffic.ts`) sem mecanismo de
  restrição eficaz para REST API chamada de cliente mobile — considerar proxy via Edge Function
  (mesmo padrão de `send-auth-email`/`send-auth-sms`).
- 🟡 `lib/report-rate-limit.ts` é cooldown puramente client-side (AsyncStorage) — bypassável
  reinstalando/chamando a API direto; falta camada server-side.

**i18n — estado após 2026-06-12:**
- ~~🔴 `location-consent.tsx` hardcoded em PT~~ — ✅ usa `t.locationConsent.*`
- ~~🔴 `report-modal.tsx` hardcoded em PT~~ — ✅ usa `t.report.*` e `t.map.report.types.*`
- ~~🟡 `geofence-alert.tsx` strings hardcoded~~ — ✅ usa `t.geofence.*` e `t.traffic.levels`
- ~~🟡 `map-view.tsx` legenda hardcoded~~ — ✅ usa `t.beach.occupancy.*`
- ~~🟡 `settings.tsx:246` inline ternário~~ — ✅ usa `t.settings.change`
- ~~🟡 `verify.tsx` ternários inline~~ — ✅ usa `t.verify.*` e `t.nav.back`
- 🟡 `app/onboarding.tsx` — usa `labelPt`/`labelEn` próprios em vez do dicionário central (aceitável para publicação)
- 🟡 `app/legal/{terms,privacy}.tsx` — apenas PT (aceitável: texto legal raramente é lido em EN por turistas)

**Outros:**
- ❓ a confirmar: `signInWithGoogle` testado ponta-a-ponta — código existe e parece completo (`lib/auth.ts:183-212`).
- ❓ a confirmar: restrições de aplicativo (bundle ID/SHA-1) configuradas no GCP Console para `EXPO_PUBLIC_GOOGLE_MAPS_KEY`.
- ~~Edge functions sem validação de HMAC~~ — ✅ `verifyHookSignature` implementado em `send-auth-email` e `send-auth-sms`.
- API DER-SP (balsa) — nenhuma API pública mapeada ainda; `getMockFerry()` é a única fonte hoje.
- Coordenadas de restaurantes e postos são aproximadas — verificar no Google Maps antes de publicar na App Store.
- Linhas de ônibus precisam verificação nos sites EMTU/Litorânea/Pássaro Marron (horários podem ter mudado).
- ~~`search_path` mutável em `increment_report_upvote`~~ — ✅ `SET search_path = public` incluído na migration `20260610215000`. Ainda pendente: `handle_new_user`, `handle_upvote_insert/delete` (baixo risco).
- Proteção de senha vazada (HaveIBeenPwned) desabilitada no Supabase Auth — baixo impacto (app usa OTP), mas fácil de ligar.
