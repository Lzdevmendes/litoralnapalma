import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useCity } from '@/context/city-context';
import { ReportModal } from './report-modal';

export function ReportButton() {
  const [open, setOpen] = useState(false);
  const { city } = useCity();

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOpen(true);
  }

  return (
    <>
      <View
        style={{
          position: 'absolute',
          bottom: 32,
          right: 20,
          zIndex: 50,
        }}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => ({
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#0077b6',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,119,182,0.4)',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Text style={{ fontSize: 22 }}>📢</Text>
        </Pressable>
      </View>

      <ReportModal visible={open} onClose={() => setOpen(false)} city={city} />
    </>
  );
}
