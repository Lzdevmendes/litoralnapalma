# Litoral na Palma 🌊

App de informações em tempo real para o **Litoral Norte de São Paulo** — Caraguatatuba, Ubatuba, São Sebastião e Ilhabela.

## Funcionalidades

- 🌤️ **Clima** — temperatura, UV, umidade, vento
- 🚗 **Trânsito** — status das principais vias em tempo real
- 🏖️ **Praias** — ocupação, qualidade da água, ondas
- 🏥 **UPAs** — tempo de espera e status das unidades de saúde
- 🗺️ **Mapa ao Vivo** — marcadores de praias, UPAs e reportes da comunidade
- 📢 **Reportes** — envie ocorrências (acidentes, blitz, lotação)
- 🧭 **Roteiro Lado B** — alternativas inteligentes quando há congestionamento
- 🔔 **Alertas Geofencing** — notificações de lotação e trânsito em tempo real
- 👤 **Modos** — Morador e Turista com conteúdo adaptado

## Tech Stack

- [Expo SDK 54](https://expo.dev) + Expo Router
- React Native 0.81.5
- TanStack Query v5
- react-native-maps
- expo-blur, expo-haptics, expo-location, expo-notifications

## Rodar localmente

```bash
pnpm install
pnpm start   # Abre Metro + QR Code para Expo Go
```

> ⚠️ O mapa (`react-native-maps`) requer um **dev build**. Use `npx expo run:android` ou `npx expo run:ios` para mapas funcionando.

## Cidades cobertas

| Cidade | Status |
|--------|--------|
| Caraguatatuba | ✅ Implementado |
| Ubatuba | 🔜 Em breve |
| São Sebastião | 🔜 Em breve |
| Ilhabela | 🔜 Em breve |
