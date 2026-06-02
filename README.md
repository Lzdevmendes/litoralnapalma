# Litoral na Palma 🌊

App de informações em tempo real para o **Litoral Norte de São Paulo** — Caraguatatuba, Ubatuba, São Sebastião e Ilhabela.

## Funcionalidades

- 🌤️ **Clima** — temperatura, sensação térmica, umidade, vento, nebulosidade (OpenWeatherMap)
- 🚗 **Trânsito** — status em tempo real das rodovias (Google Routes API com fallback mock)
- 🏖️ **Praias** — ocupação, qualidade da água (CETESB), ondas
- 🏥 **UPAs** — tempo de espera e status das unidades de saúde
- ⛴️ **Balsa** — status São Sebastião ↔ Ilhabela (mock — API DER-SP pendente)
- ⛽ **Postos** — preços de combustível por cidade
- 🚌 **Ônibus** — horários com próxima partida calculada em tempo real
- 🗺️ **Mapa ao Vivo** — marcadores de praias, UPAs e reportes da comunidade
- 📢 **Reportes** — envie ocorrências (acidentes, blitz, lotação) geolocalizadas
- 🧭 **Smart Router** — sugestão de alternativas quando há congestionamento
- 🔔 **Alertas Geofencing** — notificações de lotação e trânsito por proximidade GPS
- 👤 **Modos** — Morador e Turista com conteúdo adaptado
- 🌍 **Multi-idioma** — PT-BR e EN

## Tech Stack

| Peça | Versão | Papel |
|---|---|---|
| Expo SDK | 54 | Runtime, build, plugins nativos |
| expo-router | ~6.0.24 | File-based routing |
| React Native | 0.81.5 | Framework mobile (New Architecture) |
| React | 19.1.0 | UI |
| TanStack Query | v5 | Cache, loading, refetch automático |
| Supabase | v2 | Auth (OTP) + banco (reports) |
| react-native-maps | 1.20.1 | Mapa nativo (dev build) |
| Leaflet / WebView | 1.9.4 | Mapa web (Expo Go + modal de reporte) |
| expo-location | ~19 | GPS foreground + geofencing |
| expo-notifications | ~0.32 | Notificações locais (background) |
| expo-secure-store | ~15 | Armazenamento seguro de sessão de UI |

## Cidades cobertas

| Cidade | Praias | UPA | Balsa | Restaurantes | Atrações |
|--------|--------|-----|-------|---|---|
| Caraguatatuba | 5 | 1 | Não | 6 | 4 |
| São Sebastião | 9 | 1 | Sim | 6 | 4 |
| Ubatuba | 11 | 1 | Não | 6 | 4 |
| Ilhabela | 8 | — (referência SS) | Sim | 6 | 4 |

## Rodar localmente

```bash
pnpm install
pnpm start              # Expo Go (mapa via Leaflet/WebView)
npx expo run:android    # Dev build com react-native-maps (requer Android SDK)
npx expo run:ios        # Dev build com react-native-maps (requer Xcode)
```

Sem nenhuma variável de ambiente o app roda com dados mock — útil para desenvolvimento sem chaves.

## Configuração (opcional)

Copie `.env.example` para `.env.local` e preencha as chaves desejadas:

```bash
cp .env.example .env.local
```

| Variável | Serviço | Obrigatória? |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase | Não — sem ela, auth e reports são mock |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Não |
| `EXPO_PUBLIC_OPENWEATHER_KEY` | OpenWeatherMap | Não — clima usa mock |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps SDK | Não — Leaflet cobre no Expo Go |
| `EXPO_PUBLIC_GOOGLE_ROUTES_KEY` | Google Routes API | Não — trânsito usa mock |

> ⚠️ Todas as `EXPO_PUBLIC_*` são embarcadas no bundle do app. Restrinja as chaves Google no GCP Console (por bundle ID/SHA1) e confirme que o Supabase tem RLS habilitado em todas as tabelas.

## Testes

```bash
pnpm test           # roda jest (97 testes)
npx tsc --noEmit    # type check
```

Cobertura: `lib/**/*.ts` e `hooks/**/*.ts` — configurado em `package.json > jest.collectCoverageFrom`.

## Documentação

- [`docs/EXPLICACAO.md`](docs/EXPLICACAO.md) — arquitetura didática, papel de cada peça, glossário
- [`AGENTS.md`](AGENTS.md) — guia para agentes de IA (convenções, arquitetura, RLS, mock vs real)

## Edge Functions (Supabase)

Duas funções Deno em `supabase/functions/` entregam emails e SMS de OTP customizados:

| Função | Trigger | Serviço |
|---|---|---|
| `send-auth-email` | Auth Hook → Custom Email Sender | Resend API |
| `send-auth-sms` | Auth Hook → Custom SMS Sender | Infobip API |

Consulte [AGENTS.md](AGENTS.md) para instruções de configuração dos hooks e secrets.
