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
  ui/          # Primitivos (Badge, ProgressBar, Skeleton, ErrorCard, ErrorBoundary)
hooks/         # Custom hooks (useWeather, useBeaches, useTraffic, useUPA, useReports)
lib/           # Tipos, utils, api
data/          # Mock data (TODO: substituir por APIs reais)
```

## Regras

- Inline styles — **sem** Tailwind, CSS ou StyleSheet.create
- Aliases: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/data/*`
- Commits: `feat:`, `chore:`, `fix:`, `refactor:` — **somente título, sem body, sem descrição adicional**
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

## Edge Functions (Supabase)

Duas funções deployadas em `supabase/functions/`:

| Função | Trigger | Serviço |
|---|---|---|
| `send-auth-email` | Auth Hook → Custom Email Sender | Resend API |
| `send-auth-sms` | Auth Hook → Custom SMS Sender | Infobip API |

### Ativar os hooks (Supabase Dashboard)

1. **Supabase Dashboard → Authentication → Auth Hooks**
2. Adicionar hook **"Custom Email Sender"**:
   - URL: `https://nkkaaopslozyisicyjne.supabase.co/functions/v1/send-auth-email`
   - Copiar o **Hook Secret** gerado
3. Adicionar hook **"Custom SMS Sender"**:
   - URL: `https://nkkaaopslozyisicyjne.supabase.co/functions/v1/send-auth-sms`
   - Copiar o **Hook Secret** gerado

### Configurar secrets das funções

**Supabase Dashboard → Edge Functions → Manage secrets** (ou `supabase secrets set`):

```
# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxxxx
RESEND_FROM=Litoral na Palma <noreply@seudominio.com.br>
SEND_EMAIL_HOOK_SECRET=<copiado do hook acima>

# Infobip (SMS)
INFOBIP_API_KEY=xxxxxxxxxxxxxx
INFOBIP_BASE_URL=xxxxxx.api.infobip.com
SEND_SMS_HOOK_SECRET=<copiado do hook acima>
```

> **Resend sem domínio próprio:** use `noreply@resend.dev` como FROM para testar.
> Para produção, verificar domínio em resend.com → Domains.

> **Infobip:** conta gratuita em infobip.com com 60 dias de trial e créditos de SMS.
