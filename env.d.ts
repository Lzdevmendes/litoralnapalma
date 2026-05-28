// Declarações de tipo para variáveis de ambiente Expo (EXPO_PUBLIC_*)
// Metro substitui process.env.EXPO_PUBLIC_* em tempo de build.
declare const process: {
  env: {
    EXPO_PUBLIC_OPENWEATHER_KEY?: string;
    EXPO_PUBLIC_GOOGLE_ROUTES_KEY?: string;
    EXPO_OS?: string;
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};
