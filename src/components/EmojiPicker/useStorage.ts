import { onMounted, ref, watch } from "vue";
const STORAGE_KEY = "emoji-picker";
const MAX_LIMIT = 8;

export function useStorage() {
  const lastUsedEmojis = ref<string[]>([]);

  const pushToStorage = (emoji: string) => {
    const index = lastUsedEmojis.value.indexOf(emoji);
    if (index !== -1) {
      lastUsedEmojis.value.splice(index, 1);
      lastUsedEmojis.value = [emoji, ...lastUsedEmojis.value];
      return;
    }
    if (lastUsedEmojis.value.length < MAX_LIMIT) {
      lastUsedEmojis.value.unshift(emoji);
    } else {
      lastUsedEmojis.value = [emoji, ...lastUsedEmojis.value.slice(0, -1)];
    }
  };

  watch(lastUsedEmojis, (emojis) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emojis));
  });

  onMounted(() => {
    const savedEmojis = localStorage.getItem(STORAGE_KEY);
    if (!savedEmojis) return;
    lastUsedEmojis.value = JSON.parse(savedEmojis) as string[];
  });

  return {
    lastUsedEmojis,
    pushToStorage,
  };
}
