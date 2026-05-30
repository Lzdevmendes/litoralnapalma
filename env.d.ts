// Declarações de tipo para variáveis de ambiente Expo (EXPO_PUBLIC_*)
// Metro substitui process.env.EXPO_PUBLIC_* em tempo de build.
declare const process: {
  env: {
    EXPO_PUBLIC_OPENWEATHER_KEY?: string;
    EXPO_PUBLIC_GOOGLE_MAPS_KEY?: string;
    EXPO_PUBLIC_GOOGLE_ROUTES_KEY?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_OS?: string;
    [key: string]: string | undefined;
  };
};
