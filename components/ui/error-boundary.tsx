import { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: ReactNode;
  /** Fallback customizado — se omitido usa o padrão. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Captura erros de render nos filhos e exibe uma UI de fallback.
 * Deve ser usado em React class component (requisito da API de Error Boundary).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 48 }}>💥</Text>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>
              Algo deu errado
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              Um erro inesperado ocorreu. Tente reiniciar a seção.
            </Text>
          </View>
          <Pressable
            onPress={this.handleReset}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#005f92' : '#0077b6',
              borderRadius: 14,
              paddingHorizontal: 24,
              paddingVertical: 12,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>↺ Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
