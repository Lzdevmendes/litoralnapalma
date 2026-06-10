import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Litoral na Palma",
  slug: "litoralnapalma",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "litoralnapalma",
  userInterfaceStyle: "light",

  // ── Splash screen ──────────────────────────────────────────────────────────
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0077b6",
  },

  // ── iOS ────────────────────────────────────────────────────────────────────
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.litoralnapalma.app",
    buildNumber: "1",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Usamos sua localização para mostrar alertas de praias e trânsito próximos a você.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Usamos sua localização para mostrar alertas de praias e trânsito próximos a você.",
      // Política de privacidade exigida pela App Store
      NSPrivacyPolicy: "https://litoralnapalma.com.br/privacidade",
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType:
            "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
        },
      ],
    },
  },

  // ── Android ────────────────────────────────────────────────────────────────
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
      backgroundColor: "#0077b6",
    },
    package: "com.litoralnapalma.app",
    versionCode: 1,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "POST_NOTIFICATIONS",
      "VIBRATE",
    ],
  },

  // ── Plugins ────────────────────────────────────────────────────────────────
  plugins: [
    "expo-router",
    "expo-location",
    "expo-video",
    "expo-splash-screen",
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#0077b6",
        sounds: [],
      },
    ],
    "expo-font",
    [
      "expo-build-properties",
      {
        android: { newArchEnabled: true },
        ios: { newArchEnabled: true },
      },
    ],
  ],

  experiments: {
    typedRoutes: false,
  },
};

export default config;
