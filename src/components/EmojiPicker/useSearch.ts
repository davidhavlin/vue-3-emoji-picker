import { computed, ref, watch } from "vue";

function debounce(callback: Function, timeout = 300) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(null, args);
    }, timeout);
  };
}

export function useSearch(emojis: any) {
  const searchValue = ref("");
  const searchWord = ref("");

  const setSearchWord = (value: string) => {
    searchWord.value = value;
  };
  const debouncedSearch = debounce(setSearchWord);

  const foundEmojis = computed(() => {
    const word = searchWord.value.toLowerCase();
    if (!word) return [];
    const results: string[] = [];

    for (const emojiName in emojis) {
      const emoji = emojis[emojiName];
      if (emojiName.toLowerCase().includes(word)) {
        results.push(emoji);
      }
    }
    return results;
  });

  watch(searchValue, (value: string) => {
    if (!value) {
      searchWord.value = "";
    }
    debouncedSearch(value);
  });

  return { searchValue, foundEmojis };
}
