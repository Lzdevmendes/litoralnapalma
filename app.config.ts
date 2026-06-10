import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Litoral na Palma",
  slug: "litoralnapalma",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "litoralnapalma",
  userInterfaceStyle: "light",
  splash: {
    backgroundColor: "#0077b6",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.litoralnapalma.app",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Usamos sua localização para mostrar alertas de praias e trânsito próximos a você.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0077b6",
    },
    package: "com.litoralnapalma.app",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
    permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
  },

  plugins: [
    "expo-router",
    "expo-location",
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#0077b6",
      },
    ],
    "expo-font",
  ],
  experiments: {
    typedRoutes: false,
  },
};

export default config;
