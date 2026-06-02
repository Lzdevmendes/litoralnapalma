# Litoral na Palma — Explicação Técnica Completa

## O que o app entrega

**Litoral na Palma** é um painel informativo em tempo real para o Litoral Norte de São Paulo — Caraguatatuba, Ubatuba, São Sebastião e Ilhabela. Ele responde à pergunta central de quem chega ou mora no litoral: _"O que está acontecendo agora?"_

### Jornada típica de usuário

**Turista chegando na cidade:**
1. Abre o app → faz login (email ou telefone, OTP) → onboarding inicial
2. Seleciona "Turista" e a cidade destino (ex: Ilhabela)
3. Dashboard mostra: clima atual, trânsito nas rodovias, status da balsa, praias lotadas ou não, restaurantes e atrações
4. GeofenceAlert dispara: "Praia Feiticeira lotada a 1.2km" — haptics + banner
5. Toca em "Reportar" → marca um acidente na Rio-Santos → a comunidade vê no mapa

**Morador:**
1. Abre o app (já logado — sessão persiste) → view de Morador
2. Vê trânsito nas rodovias de sua cidade, UPA mais próxima com fila
3. Confere qualidade da água das praias (dados CETESB, atualizados semanalmente)
4. Acesso à SmartRouter — rota alternativa quando trânsito está parado

### Comportamento online vs offline/mock

| Dado | Online (com chave) | Offline/sem chave |
|---|---|---|
| Clima | OpenWeatherMap API | Mock com dados aleatórios realistas |
| Trânsito | Google Routes API | Mock com níveis aleatórios ponderados |
| Balneabilidade | CETESB ArcGIS (pública) | Erro silencioso — sem fallback |
| Reports | Supabase (banco real) | Mock em memória (lista hardcoded) |
| Balsa | **Sempre mock** | — (TODO) |
| Praias, UPA, Ônibus, Postos | **Sempre mock** | — (fonte real não integrada) |

O app funciona 100% sem nenhuma chave configurada — dados são plausíveis mas simulados. O único caso que não tem fallback é o CETESB (API pública sem auth).

---

## Papel de cada peça

### Expo / expo-router

**Por que existe:** Expo é o toolkit que abstrai o React Native para iOS e Android. O expo-router usa o sistema de arquivos como rotas — cada arquivo em `app/` vira uma tela, eliminando configuração manual de navegação.

**O que quebraria sem:** Sem Expo, cada nativo (câmera, GPS, notificações, secure storage) precisaria de código nativo manual. Sem expo-router, precisaríamos de React Navigation com toda a configuração de stacks/tabs.

**Mapa de rotas:**
```
app/_layout.tsx       → root (providers + Stack navegador)
app/index.tsx         → dashboard principal (guard de auth + onboarding)
app/onboarding.tsx    → fluxo de escolha de modo (turista/morador)
app/auth/login.tsx    → login OTP (email ou telefone)
app/auth/register.tsx → cadastro (nome + email/telefone)
app/auth/verify.tsx   → inserção do código OTP
app/praia/[id].tsx    → detalhe de praia (rota dinâmica)
app/posto/[id].tsx    → detalhe de posto (rota dinâmica)
```

### TanStack React Query

**Por que existe:** Gerencia todo o estado de dados remotos — cache, loading, erro, refetch automático. Sem ele teríamos `useEffect` + `useState` em cada componente, sem cache compartilhado e sem invalidação coordenada.

**Como funciona no app:**
- Cada hook (`useWeather`, `useTraffic`, `useBeaches`...) cria uma query com uma `queryKey` que inclui o ID da cidade
- Mudar de cidade automaticamente re-busca todos os dados (as queries da cidade antiga ficam em cache)
- `staleTime` define quando o dado está "velho" — clima: 3min, CETESB: 24h, balsa: 10min
- `refetchInterval` renova automaticamente — trânsito a cada 5min, reports a cada 60s

**QueryKey convention:**
```ts
["weather", city.id]   // clima de uma cidade específica
["reports", city.id]   // reports de uma cidade
["water-quality"]      // CETESB — global (sem cidade, cobre o litoral todo)
["bus", city.id]       // linhas de ônibus
```

### Supabase

**Por que existe:** Backend-as-a-Service que fornece banco de dados Postgres + autenticação OTP por email/SMS + storage.

**O que o app usa:**
- **Auth:** login via OTP (email com Resend, SMS com Infobip) — Supabase gerencia tokens JWT, refresh automático
- **Database:** tabela `reports` (ocorrências comunitárias) + tabela `report_upvotes`
- **Edge Functions:** `send-auth-email` e `send-auth-sms` são funções Deno que recebem Auth Hooks do Supabase e chamam Resend/Infobip para enviar OTP

**Modo sem Supabase:** todas as funções de auth e reports têm um branch `if (!isSupabaseConfigured)` que retorna mock com delay artificial — OTP `000000` é aceito, usuário criado localmente.

**Sessão:** Supabase persiste tokens JWT em `AsyncStorage` (adapter obrigatório para React Native). O `AuthContext` guarda o perfil do usuário (`AuthUser`) em `SecureStore` como cache rápido de UI.

### react-native-maps + Leaflet/WebView

**Por que dois mapas existem:**

`react-native-maps` renderiza um mapa nativo (Google Maps no Android, Apple Maps/Google Maps no iOS) com marcadores de alta performance. Porém exige um **dev build** — não funciona no Expo Go.

Para quem usa Expo Go (desenvolvimento rápido), o app usa um `WebView` com **Leaflet** (biblioteca JavaScript de mapas open-source, OpenStreetMap como tile provider) renderizado via HTML local. É mais lento e sem gestos nativos, mas não exige build.

**Decisão condicional:**
```tsx
// components/map/map-view.tsx
if (process.env.EXPO_OS === 'web' || isExpoGo) {
  return <WebviewMap />;
}
return <NativeMapView />;
```

O **modal de reporte** usa sempre Leaflet/WebView para o picker de localização — funciona em todos os ambientes e não exige Maps SDK.

### expo-location

**Por que existe:** Acesso à localização real do dispositivo para:
1. **GeofenceAlert** — calcula distância entre usuário e praias/reportes via Haversine, dispara alertas de proximidade
2. **ReportModal** — permite usar GPS atual como coordenada do reporte

**Como funciona:** `useGeolocation` pede permissão de foreground (`requestForegroundPermissionsAsync`), obtém posição inicial e depois ativa `watchPositionAsync` — atualiza a cada 50m ou 30s.

**Sem permissão:** `coords` fica `null`. GeofenceAlert só dispara alertas de tráfego (que não precisam de GPS). O modal de reporte oferece o mapa Leaflet como alternativa.

### expo-notifications

**Por que existe:** Notificações locais para alertas de trânsito/praia/reporte que chegam enquanto o app está em background.

**Como funciona:** `lib/notifications.ts` tem guard para Expo Go (onde push notifications foram removidas no SDK 53). `sendLocalNotification` só dispara se o app está em background (AppState.currentState !== 'active') — evita dupliação com o banner in-app do `GeofenceAlert`.

### expo-secure-store

**Por que existe:** Armazenamento criptografado para dados sensíveis — no caso, o perfil do usuário autenticado (`AuthUser` serializado) como cache de UI. Em iOS usa Keychain, no Android usa Android Keystore.

**Separação de responsabilidades:**
- `SecureStore` → `AuthUser` (nome, email/telefone, ID) — cache de UI
- `AsyncStorage` → sessão Supabase (tokens JWT), preferências de cidade, idioma, modo

> ⚠️ **Nota de segurança:** Os tokens JWT do Supabase ficam em `AsyncStorage` (não criptografado). Em dispositivos rooteados, isso é um risco. A solução ideal é usar um wrapper `LargeSecureStore` que divide os dados em chunks de < 2KB para o SecureStore.

### i18n custom

**Por que existe:** O app tem dois idiomas (PT-BR e EN). Ao invés de bibliotecas pesadas como i18next, usa um dicionário TypeScript simples com tipos inferidos.

**Como funciona:**
```ts
const t = translations[locale]; // tipo Translations (mesma shape do PT)
t.traffic.levels.livre          // "Livre" (PT) ou "Clear" (EN)
```

O `LanguageContext` expõe `t` (traduções do locale atual) e `setLocale`. Preferência salva em `AsyncStorage`. Nomes próprios (praias, rodovias, cidades) não são traduzidos — apenas UI strings.

---

## Glossário de entidades

| Entidade | Descrição | Onde |
|---|---|---|
| `City` | Configuração estática de uma cidade (praias, UPAs, rodovias, postos, ônibus, restaurantes, atrações) | `data/cities.ts` |
| `Beach` | Dados dinâmicos de uma praia (ocupação, qualidade água, ondas) | `lib/types.ts` |
| `BeachStatic` | Configuração fixa de praia (id, nome, coords, amenidades) | `data/cities.ts` |
| `TrafficRoute` | Status de uma rodovia (nível, tempo de viagem) | `lib/types.ts` |
| `HighwayStatic` | Config estática de rodovia (id, nome, distância típica) | `data/cities.ts` |
| `Report` | Ocorrência comunitária (tipo, coords, upvotes, expiração) | `lib/types.ts` |
| `ReportType` | `lotacao_praia`, `acidente`, `blitz`, `falta_agua`, `falta_luz`, `outro` | `lib/types.ts` |
| `UPA` | Unidade de Pronto Atendimento com fila e status | `lib/types.ts` |
| `FerryStatus` | Status da balsa São Sebastião ↔ Ilhabela | `lib/types.ts` |
| `AuthUser` | Perfil de usuário autenticado (id, nome, email/telefone) | `lib/auth.ts` |
| `UserMode` | `morador` (dashboard focado em infraestrutura) ou `turista` (+ restaurantes e atrações) | `lib/types.ts` |
| `Locale` | `pt` ou `en` | `lib/i18n.ts` |

## Cidades cobertas

| Cidade | Praias | UPA | Balsa | Status |
|---|---|---|---|---|
| Caraguatatuba | 5 | 1 | Não | Completa |
| São Sebastião | 9 | 1 | Sim (→ Ilhabela) | Completa |
| Ubatuba | 11 | 1 | Não | Completa |
| Ilhabela | 8 | 0 (referência: UPA de SS) | Sim (→ SS) | Completa |

Todas as 4 cidades estão implementadas em `data/cities.ts` com dados estáticos completos. Os dados dinâmicos (ocupação, qualidade, fila UPA) são gerados pelo mock em `data/mock.ts`.
