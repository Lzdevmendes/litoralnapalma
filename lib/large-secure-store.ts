import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800; // bytes — SecureStore tem limite de ~2KB por chave

export class LargeSecureStore {
  async getItem(key: string): Promise<string | null> {
    try {
      const countStr = await SecureStore.getItemAsync(`${key}__count`);
      if (!countStr) return null;
      const count = parseInt(countStr, 10);
      if (isNaN(count) || count <= 0) return null;
      const chunks = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          SecureStore.getItemAsync(`${key}__${i}`),
        ),
      );
      if (chunks.some((c) => c === null)) return null;
      return chunks.join('');
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await Promise.all([
      SecureStore.setItemAsync(`${key}__count`, String(chunks.length)),
      ...chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}__${i}`, chunk)),
    ]);
  }

  async removeItem(key: string): Promise<void> {
    try {
      const countStr = await SecureStore.getItemAsync(`${key}__count`);
      const count = countStr ? parseInt(countStr, 10) : 0;
      await Promise.all([
        SecureStore.deleteItemAsync(`${key}__count`),
        ...Array.from({ length: isNaN(count) ? 0 : count }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}__${i}`),
        ),
      ]);
    } catch {
      // ignora falhas de remoção
    }
  }
}
