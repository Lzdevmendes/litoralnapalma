import { View, Text, Pressable, Modal } from 'react-native';
import { AVATAR_OPTIONS, type AvatarEmoji } from '@/hooks/useAvatar';
import { C } from '@/lib/design';

interface Props {
  visible: boolean;
  current: AvatarEmoji | null;
  onSelect: (emoji: AvatarEmoji) => void;
  onClose: () => void;
  labelPt?: boolean;
}

export function AvatarPicker({ visible, current, onSelect, onClose, labelPt = true }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{
          backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 24, gap: 20,
        }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, marginTop: 8 }}>
              {labelPt ? 'Escolher avatar' : 'Choose avatar'}
            </Text>
            <Text style={{ fontSize: 13, color: C.textMuted }}>
              {labelPt ? 'Toque para selecionar' : 'Tap to select'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {AVATAR_OPTIONS.map((emoji) => {
              const active = emoji === current;
              return (
                <Pressable
                  key={emoji}
                  onPress={() => { onSelect(emoji); onClose(); }}
                  style={({ pressed }) => ({
                    width: 64, height: 64, borderRadius: 20,
                    backgroundColor: active ? `${C.primary}14` : pressed ? '#f1f5f9' : '#f8fafc',
                    borderWidth: 2,
                    borderColor: active ? C.primary : '#e2e8f0',
                    alignItems: 'center', justifyContent: 'center',
                  })}
                >
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onClose} style={({ pressed }) => ({
            paddingVertical: 14, borderRadius: 16,
            backgroundColor: pressed ? '#f1f5f9' : '#f8fafc',
            alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
          })}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.textSecondary }}>
              {labelPt ? 'Cancelar' : 'Cancel'}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
