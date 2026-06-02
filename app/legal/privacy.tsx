import { ScrollView, View, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';

const LAST_UPDATED = '02 de junho de 2026';
const CONTACT_EMAIL = 'privacidade@litoralnapalma.com.br';

const sections = [
  {
    title: '1. Controlador dos Dados',
    body: 'Litoral na Palma é o controlador dos dados pessoais coletados por este aplicativo, nos termos da Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Contato do DPO (Encarregado de Dados): privacidade@litoralnapalma.com.br',
  },
  {
    title: '2. Dados Coletados',
    body:
      'Coletamos os seguintes dados pessoais:\n\n' +
      '• Nome: fornecido no cadastro, usado para identificação no app.\n' +
      '• E-mail ou telefone: fornecido no cadastro, usado para autenticação via OTP.\n' +
      '• Localização GPS (foreground): coletada apenas quando o app está aberto e em uso, com sua permissão explícita. Usada para alertas de praias e reportes próximos.\n' +
      '• Identificador de dispositivo (device_id): UUID aleatório gerado no primeiro uso, usado para deduplicar votos em reportes. Não identifica você pessoalmente.\n' +
      '• Conteúdo de reportes: tipo de ocorrência, descrição e coordenadas geográficas que você envia voluntariamente.',
  },
  {
    title: '3. Finalidade do Tratamento',
    body:
      'Tratamos seus dados para:\n\n' +
      '• Autenticação e manutenção da sua conta.\n' +
      '• Exibir alertas geofencing personalizados quando você está próximo de praias lotadas ou acidentes reportados.\n' +
      '• Publicar reportes comunitários visíveis a outros usuários da mesma cidade.\n' +
      '• Prevenir abuso (deduplicação de votos via device_id).\n' +
      '• Análise de erros técnicos para melhoria do serviço.',
  },
  {
    title: '4. Base Legal (LGPD)',
    body:
      'Tratamos seus dados com base nos seguintes fundamentos (Art. 7° da LGPD):\n\n' +
      '• Consentimento (Art. 7°, I): localização GPS — você pode revogar a qualquer momento nas configurações do sistema.\n' +
      '• Execução de contrato (Art. 7°, V): e-mail/telefone para autenticação.\n' +
      '• Legítimo interesse (Art. 7°, IX): device_id para integridade do sistema de votos.\n' +
      '• Consentimento do titular: reportes comunitários publicados voluntariamente.',
  },
  {
    title: '5. Localização GPS — Detalhes',
    body:
      'Sua localização é coletada SOMENTE enquanto o app está em uso (foreground). Nunca coletamos localização em segundo plano.\n\n' +
      'A localização é processada localmente no dispositivo para calcular distâncias e exibir alertas. Ela NÃO é enviada para nossos servidores nem armazenada de forma persistente.\n\n' +
      'Você pode revogar a permissão de localização a qualquer momento em Configurações do Sistema → Privacidade → Localização → Litoral na Palma.',
  },
  {
    title: '6. Compartilhamento de Dados',
    body:
      'Compartilhamos dados com os seguintes operadores (prestadores de serviço):\n\n' +
      '• Supabase Inc. (EUA): banco de dados e autenticação. Dados protegidos por acordo de DPA conforme GDPR/LGPD.\n' +
      '• Resend Inc. (EUA): envio de e-mails de verificação OTP.\n' +
      '• Infobip Ltd. (Croácia): envio de SMS de verificação OTP.\n\n' +
      'NÃO vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.\n\n' +
      'Reportes comunitários são visíveis publicamente a outros usuários do app na mesma cidade, conforme a natureza do serviço.',
  },
  {
    title: '7. Retenção de Dados',
    body:
      '• Reportes: expiram automaticamente em 24 horas após a criação.\n' +
      '• Dados de conta (nome, e-mail/telefone): mantidos enquanto a conta estiver ativa.\n' +
      '• Logs de autenticação: 90 dias, conforme política da Supabase.\n' +
      '• device_id: mantido localmente no dispositivo enquanto o app estiver instalado.\n\n' +
      'Após exclusão da conta, os dados pessoais são removidos em até 30 dias, exceto quando retidos por obrigação legal.',
  },
  {
    title: '8. Seus Direitos (LGPD, Art. 18)',
    body:
      'Você tem os seguintes direitos sobre seus dados:\n\n' +
      '• Confirmação e acesso: saber quais dados temos sobre você.\n' +
      '• Correção: atualizar dados incompletos ou desatualizados.\n' +
      '• Anonimização, bloqueio ou eliminação: de dados desnecessários ou tratados em desconformidade.\n' +
      '• Portabilidade: receber seus dados em formato estruturado.\n' +
      '• Eliminação: excluir seus dados e conta (App → Configurações → Excluir conta).\n' +
      '• Informação sobre compartilhamento: saber com quem seus dados são compartilhados.\n' +
      '• Revogação do consentimento: a qualquer momento, sem prejudicar tratamentos anteriores.\n\n' +
      'Para exercer seus direitos: privacidade@litoralnapalma.com.br',
  },
  {
    title: '9. Segurança',
    body:
      'Adotamos medidas técnicas e organizacionais para proteger seus dados:\n\n' +
      '• Tokens de sessão armazenados em armazenamento seguro e criptografado do dispositivo (Keychain/Keystore).\n' +
      '• Comunicação com servidores via HTTPS/TLS.\n' +
      '• Acesso ao banco restrito por políticas de Row Level Security (RLS).\n' +
      '• OTP de uso único com expiração de 10 minutos.',
  },
  {
    title: '10. Transferência Internacional',
    body: 'Nossos operadores (Supabase, Resend, Infobip) estão fora do Brasil. As transferências ocorrem com base em cláusulas contratuais padrão (DPA) que garantem nível de proteção equivalente ao exigido pela LGPD, conforme Art. 33 da Lei 13.709/2018.',
  },
  {
    title: '11. Cookies e Rastreamento',
    body: 'O App NÃO utiliza cookies de terceiros para rastreamento ou publicidade. Utilizamos apenas armazenamento local (AsyncStorage e SecureStore) para funcionalidade essencial do app.',
  },
  {
    title: '12. Menores de Idade',
    body: 'Não coletamos intencionalmente dados de crianças menores de 13 anos. Se soubermos que coletamos dados de uma criança, excluiremos imediatamente. Pais podem contatar privacidade@litoralnapalma.com.br.',
  },
  {
    title: '13. Alterações desta Política',
    body: 'Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas via notificação no app ou email cadastrado, com no mínimo 15 dias de antecedência.',
  },
  {
    title: '14. Autoridade de Proteção de Dados',
    body: 'Você pode registrar reclamações junto à ANPD (Autoridade Nacional de Proteção de Dados): anpd.gov.br',
  },
];

export default function PrivacyScreen() {
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
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>Política de Privacidade</Text>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>LGPD · Lei 13.709/2018</Text>
        </View>
        <Text style={{ fontSize: 20 }}>🔒</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* LGPD badge */}
        <View
          style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#bbf7d0',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#166534' }}>🛡️ Seus Dados Estão Protegidos</Text>
          <Text style={{ fontSize: 12, color: '#15803d', lineHeight: 18 }}>
            Esta política está em conformidade com a LGPD (Lei Geral de Proteção de Dados — Lei 13.709/2018).
          </Text>
          <Text style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>
            Última atualização: {LAST_UPDATED}
          </Text>
        </View>

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

        {/* Contact */}
        <View
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#bfdbfe',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e40af' }}>✉️ Fale com nosso DPO</Text>
          <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            <Text style={{ fontSize: 13, color: '#3b82f6', textDecorationLine: 'underline' }}>
              {CONTACT_EMAIL}
            </Text>
          </Pressable>
          <Text style={{ fontSize: 12, color: '#60a5fa', lineHeight: 18 }}>
            Respondemos em até 15 dias úteis, conforme Art. 18 da LGPD.
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16, gap: 4 }}>
          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            © 2026 Litoral na Palma — São Paulo, Brasil
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
