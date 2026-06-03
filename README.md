# Litoral na Palma 🌊

App de informações em tempo real para o **Litoral Norte de São Paulo** — Caraguatatuba, Ubatuba, São Sebastião e Ilhabela.

## Funcionalidades

- 🌤️ **Clima** — temperatura, sensação térmica, umidade, vento, nebulosidade (OpenWeatherMap)
- 🚗 **Trânsito** — status em tempo real das rodovias (Google Routes API)
- 🏖️ **Praias** — ocupação, qualidade da água (CETESB ArcGIS), ondas
- 🏥 **UPAs** — tempo de espera e status das unidades de saúde
- ⛴️ **Balsa** — status São Sebastião ↔ Ilhabela
- ⛽ **Postos** — preços de combustível por cidade
- 🚌 **Ônibus** — horários com próxima partida calculada em tempo real
- 🅿️ **Zona Azul** — vagas de estacionamento disponíveis por zona regulamentada
- 🗺️ **Mapa ao Vivo** — marcadores de praias, UPAs e reportes da comunidade
- 📢 **Reportes** — envie ocorrências (acidentes, blitz, lotação) geolocalizadas
- 🧭 **Smart Router** — sugestão de alternativas quando há congestionamento
- 🔔 **Alertas Geofencing** — notificações de lotação e trânsito por proximidade GPS
- 👤 **Modos** — Morador e Turista com conteúdo adaptado
- 🌍 **Multi-idioma** — PT-BR e EN

## Tech Stack

| Peça               | Versão  | Papel                               |
| ------------------ | ------- | ----------------------------------- |
| Expo SDK           | 54      | Runtime, build, plugins nativos     |
| expo-router        | ~6.0.24 | File-based routing                  |
| React Native       | 0.81.5  | Framework mobile (New Architecture) |
| React              | 19.1.0  | UI                                  |
| TanStack Query     | v5      | Cache, loading, refetch automático  |
| Supabase           | v2      | Auth (OTP) + banco (reports)        |
| react-native-maps  | 1.20.1  | Mapa nativo (dev build)             |
| Leaflet / WebView  | 1.9.4   | Mapa web (Expo Go)                  |
| expo-location      | ~19     | GPS foreground + geofencing         |
| expo-notifications | ~0.32   | Notificações locais                 |
| expo-secure-store  | ~15     | Armazenamento seguro de sessão      |

## Cidades cobertas

| Cidade        | Praias | UPA               | Balsa | Zonas de Estacionamento | Restaurantes | Atrações |
| ------------- | ------ | ----------------- | ----- | ----------------------- | ------------ | -------- |
| Caraguatatuba | 5      | 1                 | Não   | 3                       | 6            | 4        |
| São Sebastião | 9      | 1                 | Sim   | 3                       | 6            | 4        |
| Ubatuba       | 11     | 1                 | Não   | 3                       | 6            | 4        |
| Ilhabela      | 8      | — (referência SS) | Sim   | 2                       | 6            | 4        |

## Rodar localmente

```bash
pnpm install
pnpm start              # Expo Go (mapa via Leaflet/WebView)
npx expo run:android    # Dev build com react-native-maps (requer Android SDK)
npx expo run:ios        # Dev build com react-native-maps (requer Xcode)
```

## Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha as chaves:

```bash
cp .env.example .env.local
```

### Passo a passo completo

#### 1. Supabase (auth OTP + reports em tempo real)

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e crie um projeto
2. Vá em **Project Settings → API**
3. Copie **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
4. Copie **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. Execute as migrations em `supabase/` para criar as tabelas `reports` e `report_upvotes`
6. **Obrigatório:** ative RLS em ambas as tabelas (veja seção RLS abaixo)

> Sem Supabase: auth usa OTP fake (`000000`), reports ficam em memória e somem ao reiniciar.

#### 2. OpenWeatherMap (clima)

1. Crie conta em [openweathermap.org](https://openweathermap.org/api)
2. Vá em **My API Keys** e copie a chave → `EXPO_PUBLIC_OPENWEATHER_KEY`
3. **Plano gratuito** cobre o endpoint `/weather` (temperatura, condição, vento, umidade)

> A chave leva até 2h para ativar após o cadastro. Sem chave: clima usa estimativa.

#### 3. Google Cloud (mapas nativos + trânsito)

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie ou selecione um projeto
3. Em **APIs & Services → Library**, habilite:
   - `Maps SDK for Android`
   - `Maps SDK for iOS`
   - `Routes API`
4. Em **APIs & Services → Credentials**, crie uma **API Key**
5. Copie a mesma chave para **ambas** as variáveis:
   - `EXPO_PUBLIC_GOOGLE_MAPS_KEY` (mapa nativo no dev build)
   - `EXPO_PUBLIC_GOOGLE_ROUTES_KEY` (dados de trânsito)
6. **Restrinja a chave** por bundle ID (`com.yourapp.litoralnapalma`) para evitar uso indevido

> Sem chave Google: mapa usa Leaflet/WebView (funciona no Expo Go), trânsito usa estimativa por hora do dia.

#### 4. Zona Azul (estacionamento — contrato municipal)

1. Solicite acesso à API junto à prefeitura da cidade ou operadora contratada
2. Obtenha a URL base da API e a chave de acesso
3. Preencha:
   - `EXPO_PUBLIC_ZONA_AZUL_API_KEY` → chave da API
   - `EXPO_PUBLIC_ZONA_AZUL_API_BASE` → URL base (ex: `https://api.zonaazul.sp.gov.br/v1`)

> Sem chave: ocupação das vagas é estimada automaticamente com base no horário (pico 10h–18h mostra mais vagas ocupadas).

### Tabela de variáveis

| Variável                         | Serviço           | Obrigatória?      | Sem ela                       |
| -------------------------------- | ----------------- | ----------------- | ----------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`       | Supabase          | Não               | Auth fake, reports em memória |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`  | Supabase          | Não (par com URL) | —                             |
| `EXPO_PUBLIC_OPENWEATHER_KEY`    | OpenWeatherMap    | Não               | Clima estimado                |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY`    | Google Maps SDK   | Não               | Mapa usa Leaflet/WebView      |
| `EXPO_PUBLIC_GOOGLE_ROUTES_KEY`  | Google Routes API | Não               | Trânsito estimado             |
| `EXPO_PUBLIC_ZONA_AZUL_API_KEY`  | API municipal     | Não               | Vagas estimadas por horário   |
| `EXPO_PUBLIC_ZONA_AZUL_API_BASE` | API municipal     | Não (par com KEY) | —                             |

> ⚠️ Todas as `EXPO_PUBLIC_*` ficam visíveis no bundle do app. Restrinja chaves Google por bundle ID/SHA1 no GCP Console e mantenha RLS ativo no Supabase.

## Testes

```bash
pnpm test           # Jest — 97 testes
npx tsc --noEmit    # Type check
```

## Documentação

- [`docs/EXPLICACAO.md`](docs/EXPLICACAO.md) — arquitetura, papel de cada peça, glossário
- [`AGENTS.md`](AGENTS.md) — guia para agentes de IA (convenções, mock vs real, RLS)

## Edge Functions (Supabase)

Duas funções Deno em `supabase/functions/` entregam emails e SMS de OTP customizados:

| Função            | Trigger                         | Serviço     |
| ----------------- | ------------------------------- | ----------- |
| `send-auth-email` | Auth Hook → Custom Email Sender | Resend API  |
| `send-auth-sms`   | Auth Hook → Custom SMS Sender   | Infobip API |

Consulte [AGENTS.md](AGENTS.md) para instruções de configuração dos hooks e secrets.

## RLS (Row Level Security) — obrigatório no Supabase

O `anon key` é embarcado no app e visível a qualquer pessoa. RLS garante que ninguém possa apagar ou modificar dados de outras pessoas via REST direto.

```sql
-- reports: leitura pública filtrada por cidade, escrita anon permitida
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_by_city" ON reports FOR SELECT USING (true);
CREATE POLICY "insert_anon"    ON reports FOR INSERT WITH CHECK (true);

-- report_upvotes: impede duplo-voto por device
ALTER TABLE report_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_all"   ON report_upvotes FOR SELECT USING (true);
CREATE POLICY "insert_anon"  ON report_upvotes FOR INSERT WITH CHECK (true);
ALTER TABLE report_upvotes ADD CONSTRAINT unique_device_report UNIQUE (device_id, report_id);
```
