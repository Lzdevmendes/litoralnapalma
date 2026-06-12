import { View, Text, Pressable, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/context/language-context';

interface LocationConsentProps {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function LocationConsent({ visible, onAllow, onDeny }: LocationConsentProps) {
  const { t } = useLanguage();

  function handleAllow() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAllow();
  }

  function handleDeny() {
    onDeny();
  }

  const benefits = [
    { icon: '🏖️', text: t.locationConsent.benefit1 },
    { icon: '🚨', text: t.locationConsent.benefit2 },
    { icon: '🔒', text: t.locationConsent.benefit3 },
    { icon: '📵', text: t.locationConsent.benefit4 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 28,
            width: '100%',
            maxWidth: 360,
            gap: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Icon */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: '#eff6ff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 36 }}>📍</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
              {t.locationConsent.title}
            </Text>
          </View>

          {/* Explanation */}
          <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, textAlign: 'center' }}>
            {t.locationConsent.description}
          </Text>

          {/* Benefits */}
          <View style={{ gap: 10 }}>
            {benefits.map(({ icon, text }) => (
              <View key={icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
                <Text style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 }}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={handleAllow}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#005f92' : '#0077b6',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0,119,182,0.3)',
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {t.locationConsent.allow}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeny}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f1f5f9' : 'transparent',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>
                {t.locationConsent.deny}
              </Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 16 }}>
            {t.locationConsent.footer}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
