/**
 * VideoBackground — reproduz um vídeo em loop silencioso como fundo de tela.
 *
 * Uso:
 *   1. Coloque o arquivo de vídeo em: assets/videos/beach.mp4
 *      (H.264, 720p, ≤10s, ~2–5MB — formato ideal para fundo de tela)
 *   2. Renderize como primeira camada dentro de um View com flex:1
 *
 * Fallback: se expo-video não estiver disponível (Expo Go) ou o vídeo falhar,
 * a área fica transparente — a tela deve ter um fundo definido por trás.
 */
import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as unknown as { appOwnership?: string }).appOwnership === 'expo';

// expo-video não disponível no Expo Go
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let VideoView: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useVideoPlayer: any = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-video');
    VideoView = mod.VideoView;
    useVideoPlayer = mod.useVideoPlayer;
  } catch {
    // não disponível
  }
}

// ── Componente principal ─────────────────────────────────────────────────────

interface Props {
  /** Fonte do vídeo via require(). Ex: require('../../assets/videos/beach.mp4') */
  source: ReturnType<typeof require>;
  style?: object;
}

function VideoBackgroundInner({ source, style }: Props) {
  const player = useVideoPlayer(source, (p: { loop: boolean; muted: boolean; play: () => void }) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={[StyleSheet.absoluteFill, style]}
      contentFit="cover"
      nativeControls={false}
      pointerEvents="none"
    />
  );
}

// Exporta null-safe: retorna null quando expo-video não está disponível
export function VideoBackground(props: Props) {
  if (!VideoView || !useVideoPlayer) return null;
  return <VideoBackgroundInner {...props} />;
}
