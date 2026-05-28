import { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSubmitReport } from '@/hooks/useReports';
import type { City } from '@/data/cities';
import type { ReportType } from '@/lib/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  city: City;
}

const REPORT_TYPES: { type: ReportType; emoji: string; label: string }[] = [
  { type: 'lotacao_praia', emoji: '🏖️', label: 'Praia Lotada' },
  { type: 'acidente', emoji: '🚨', label: 'Acidente' },
  { type: 'blitz', emoji: '🚔', label: 'Blitz' },
  { type: 'falta_agua', emoji: '💧', label: 'Falta d\'água' },
  { type: 'falta_luz', emoji: '⚡', label: 'Falta de luz' },
  { type: 'outro', emoji: '📍', label: 'Outro' },
];

export function ReportModal({ visible, onClose, city }: Props) {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const { mutate: submit, isPending, isSuccess } = useSubmitReport();

  function handleSubmit() {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    submit(
      {
        type: selected,
        description,
        lat: city.center.lat,
        lng: city.center.lng,
        city: city.id,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            onClose();
            setSelected(null);
            setDescription('');
          }, 1200);
        },
      }
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>📢 Novo Reporte</Text>
          <Pressable onPress={onClose}>
            <Text style={{ fontSize: 16, color: '#94a3b8' }}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tipo de ocorrência
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {REPORT_TYPES.map(({ type, emoji, label }) => (
              <Pressable
                key={type}
                onPress={() => { setSelected(type); Haptics.selectionAsync(); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: selected === type ? '#0077b6' : 'rgba(255,255,255,0.9)',
                  borderWidth: 1.5,
                  borderColor: selected === type ? '#0077b6' : 'rgba(0,0,0,0.08)',
                }}
              >
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: selected === type ? '#fff' : '#374151' }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Descrição (opcional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Acidente na Rio-Santos, km 178..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 14,
              padding: 14,
              fontSize: 14,
              color: '#1e293b',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.08)',
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!selected || isPending || isSuccess}
            style={{
              backgroundColor: selected && !isPending && !isSuccess ? '#0077b6' : '#94a3b8',
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {isSuccess ? '✅ Enviado!' : '📤 Enviar Reporte'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
