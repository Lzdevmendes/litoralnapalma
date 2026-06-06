import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@litoral_na_palma:avatar';

export const AVATAR_OPTIONS = ['🏄', '🤿', '🏊', '🚣', '🌊', '🐚', '🌴', '🦀', '🐠', '⛵', '🏖️', '🤙'] as const;
export type AvatarEmoji = typeof AVATAR_OPTIONS[number];

export function useAvatar() {
  const [avatar, setAvatarState] = useState<AvatarEmoji | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v && AVATAR_OPTIONS.includes(v as AvatarEmoji)) setAvatarState(v as AvatarEmoji);
    });
  }, []);

  const setAvatar = useCallback(async (emoji: AvatarEmoji) => {
    setAvatarState(emoji);
    await AsyncStorage.setItem(KEY, emoji);
  }, []);

  return { avatar, setAvatar };
}
