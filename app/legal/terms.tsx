import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';

const LAST_UPDATED = '02 de junho de 2026';

const sections = [
  {
    title: '1. Aceitação dos Termos',
    body: 'Ao utilizar o aplicativo Litoral na Palma ("App"), você concorda com estes Termos de Uso. Se não concordar, não utilize o App. O uso continuado após alterações implica aceitação das versões atualizadas.',
  },
  {
    title: '2. Descrição do Serviço',
    body: 'O Litoral na Palma oferece informações em tempo real sobre praias, trânsito, balsa, UPAs, postos de combustível, linhas de ônibus, restaurantes e atrações do Litoral Norte de São Paulo (Caraguatatuba, Ubatuba, São Sebastião e Ilhabela). As informações são meramente informativas e não substituem comunicados oficiais de autoridades.',
  },
  {
    title: '3. Precisão dos Dados',
    body: 'O App combina dados de fontes oficiais (CETESB para balneabilidade, Google Routes para trânsito, Supabase para reportes) com estimativas baseadas em padrões históricos para funcionalidades como tempo de espera na balsa, ocupação de praias e filas nas UPAs, quando APIs públicas não estão disponíveis. Não tome decisões críticas de segurança baseadas exclusivamente nestas informações.',
  },
  {
    title: '4. Reportes da Comunidade',
    body: 'Ao enviar um reporte (ocorrência de trânsito, lotação de praia, etc.), você declara que as informações são verdadeiras e não contêm conteúdo ofensivo, discriminatório ou ilegal. O Litoral na Palma pode remover reportes que violem estas diretrizes. Você é responsável pelo conteúdo que publica.',
  },
  {
    title: '5. Uso Permitido',
    body: 'O App é licenciado, não vendido, para uso pessoal e não-comercial. É proibido: (a) descompilar ou fazer engenharia reversa do App; (b) usar o App para atividades ilegais; (c) sobrecarregar os servidores com requisições automatizadas; (d) criar conteúdo enganoso ou spam nos reportes.',
  },
  {
    title: '6. Limitação de Responsabilidade',
    body: 'O Litoral na Palma não garante a precisão, completude ou atualidade das informações exibidas. O App é fornecido "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por danos diretos, indiretos ou consequentes decorrentes do uso ou incapacidade de uso do App.',
  },
  {
    title: '7. Disponibilidade',
    body: 'O App pode ficar indisponível temporariamente por manutenção, atualizações ou falhas de terceiros (Supabase, Google, CETESB, etc.). Não garantimos disponibilidade ininterrupta do serviço.',
  },
  {
    title: '8. Propriedade Intelectual',
    body: 'Todo o conteúdo do App (código, design, textos, logotipos) é de propriedade do Litoral na Palma ou de seus licenciadores. Dados de balneabilidade são fornecidos pela CETESB e dados de tráfego pelo Google, sujeitos às suas respectivas licenças.',
  },
  {
    title: '9. Conta do Usuário',
    body: 'Você é responsável por manter a confidencialidade do acesso à sua conta. Notifique-nos imediatamente caso suspeite de uso não autorizado. Reservamo-nos o direito de suspender contas que violem estes termos.',
  },
  {
    title: '10. Menores de Idade',
    body: 'O App é destinado a maiores de 13 anos. Se você tem menos de 18 anos, deve utilizar o App com conhecimento e supervisão dos seus responsáveis legais.',
  },
  {
    title: '11. Alterações dos Termos',
    body: 'Podemos atualizar estes termos periodicamente. Notificaremos sobre mudanças significativas via notificação no App ou email. O uso continuado após 30 dias da notificação implica aceitação das alterações.',
  },
  {
    title: '12. Legislação Aplicável',
    body: 'Estes termos são regidos pelas leis brasileiras, especialmente o Marco Civil da Internet (Lei 12.965/2014) e o Código de Defesa do Consumidor (Lei 8.078/1990). O foro competente é o da comarca de São Paulo, SP.',
  },
  {
    title: '13. Contato',
    body: 'Dúvidas sobre estes Termos de Uso: contato@litoralnapalma.com.br',
  },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: pressed ? '#e0f2fe' : '#f0f9ff',
            alignItems: 'center', justifyContent: 'center',
          })}
        >
          <Text style={{ fontSize: 18, color: '#0077b6' }}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>Termos de Uso</Text>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>Litoral na Palma</Text>
        </View>
        <Text style={{ fontSize: 20 }}>📄</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#bfdbfe',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e40af' }}>🌊 Litoral na Palma</Text>
          <Text style={{ fontSize: 12, color: '#1e40af', lineHeight: 18 }}>
            Estes Termos de Uso regem o uso do aplicativo Litoral na Palma. Leia com atenção antes de utilizar o serviço.
          </Text>
          <Text style={{ fontSize: 11, color: '#3b82f6', marginTop: 4 }}>
            Última atualização: {LAST_UPDATED}
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section) => (
          <View key={section.title} style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>
              {section.title}
            </Text>
            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20 }}>
              {section.body}
            </Text>
          </View>
        ))}

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            paddingTop: 16,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            © 2026 Litoral na Palma — Todos os direitos reservados
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            Versão 1.0 · São Paulo, Brasil
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
