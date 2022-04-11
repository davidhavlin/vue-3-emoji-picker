<template>
  <div ref="containerRef">
    <Teleport to="body">
      <transition name="container">
        <main
          v-if="showContainer"
          class="emoji-picker"
          :class="{ 'emoji-picker__hovered': hovered }"
          :style="{
            transform: `translate(${dimensions.left}px, ${dimensions.top}px) translateZ(0)`,
          }"
          v-click-outside="onClickOutside"
          v-on-resize="onResize"
          @mouseenter="hovered = true"
          @mouseleave="hovered = false"
          @touchstart="hovered = true"
          @touchend="hovered = false"
        >
          <div
            class="arrow-container"
            :class="[ARROW_POSITION[pickerPosition]]"
            :style="{
              transform: `translate(${arrowDimensions.left}px, ${arrowDimensions.top}px) translateZ(0)`,
            }"
          >
            <div
              class="picker-arrow"
              :style="{ width: ARROW_SIZE + 'px', height: ARROW_SIZE + 'px' }"
            ></div>
          </div>
          <div
            class="scrollbar-hider"
            :class="{ 'scrollbar-hider__invisible': hovered }"
          ></div>

          <div class="wrapper" :style="{ width: width + 'px' }">
            <div
              class="picker-container"
              :style="{ height: height + 'px' }"
              @click="onClick"
            >
              <header v-if="props.showSearch">
                <input
                  class="picker-input"
                  v-model="searchValue"
                  :placeholder="props.placeholder"
                  type="text"
                />
                <div class="picker-input__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </header>

              <section class="section-used" v-if="lastUsedEmojis.length > 0">
                <div class="category-name special">Last used</div>
                <div class="emoji-container special">
                  <div
                    v-for="emoji in lastUsedEmojis"
                    :key="emoji"
                    class="emoji"
                  >
                    {{ emoji }}
                  </div>
                </div>
              </section>

              <template v-if="foundEmojis.length > 0">
                <section class="section-used">
                  <div class="category-name special">search results</div>
                  <div class="emoji-container special">
                    <div
                      v-for="(emoji, i) in foundEmojis"
                      :key="`found-${emoji}-${i}`"
                      class="emoji"
                    >
                      {{ emoji }}
                    </div>
                  </div>
                </section>
              </template>

              <template v-else>
                <section v-if="props.showCategories" class="section-categories">
                  <div class="category-name special">Categories</div>
                  <div class="categories-container">
                    <div
                      v-for="(firstEmoji, category) in categories"
                      :key="category"
                      class="category-item"
                      :class="{
                        selected: selectedCategories.indexOf(category) !== -1,
                      }"
                      @click="onClickCategory(category)"
                      :title="category"
                    >
                      {{ firstEmoji }}
                    </div>
                  </div>
                </section>

                <section
                  v-for="(category, name) in filteredEmojis"
                  :key="name"
                  class="section-category"
                >
                  <div class="category-name">{{ name }}</div>
                  <div class="emoji-container">
                    <div
                      v-for="(emoji, desc) in category"
                      :key="desc"
                      :title="String(desc)"
                      class="emoji"
                    >
                      {{ emoji }}
                    </div>
                  </div>
                </section>
              </template>
            </div>
          </div>
        </main>
      </transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
  nextTick,
  computed,
} from "vue";
import emojis, { categories, allEmojis } from "./emojis";
import { vClickOutside, vOnResize } from "./directives";
import { useStorage } from "./useStorage";
import { useSearch } from "./useSearch";

type TPositions = "top" | "bottom" | "left" | "right" | "center";

interface Props {
  placeholder?: string;
  modelValue?: boolean | null;
  width?: number;
  height?: number;
  position?: TPositions;
  offset?: number[];
  showArrow?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Search emojis...",
  modelValue: null,
  width: 240,
  height: 250,
  position: "bottom",
  offset: () => [0, 0],
  showArrow: true, // todo change later
  showSearch: true,
  showCategories: false,
});
const emit = defineEmits(["selectedEmoji", "update:modelValue"]);

const { pushToStorage, lastUsedEmojis } = useStorage();
const { searchValue, foundEmojis } = useSearch(allEmojis);

const directions: { [key in TPositions]: TPositions[] } = {
  left: ["left", "right", "bottom", "top"],
  right: ["right", "left", "bottom", "top"],
  top: ["top", "bottom", "left", "right"],
  bottom: ["bottom", "top", "left", "right"],
  center: ["center"],
};

const ARROW_SIZE = 13;
const ARROW_OFFSET = props.showArrow ? (Math.sqrt(2) * ARROW_SIZE) / 2 : 0;
const ARROW_POSITION = {
  top: "arrow-bottom",
  bottom: "arrow-top",
  left: "arrow-right",
  right: "arrow-left",
  center: "arrow-none",
};

const pickerPosition = ref(props.position);
const containerRef = ref<HTMLElement | null>(null);

const innerValue = ref(true);
const showContainer = computed({
  get: () =>
    typeof props.modelValue === "boolean" ? props.modelValue : innerValue.value,
  set: (value: boolean) => {
    typeof props.modelValue === "boolean"
      ? emit("update:modelValue", value)
      : (innerValue.value = value);
  },
});
watch(
  () => showContainer.value,
  (showed) => {
    nextTick(() => {
      if (!showed) {
        clickCounter.value = 0;
        return;
      }
      const parentEl = containerRef.value?.parentElement;
      handlePosition(parentEl);
    });
  },
  { immediate: true }
);

function handlePosition(el: HTMLElement | null | undefined) {
  if (!el) return;
  for (const way of directions[props.position]) {
    if (isEnoughSpace(way, el)) {
      pickerPosition.value = way;
      setDimensions(el);
      break;
    }
  }
}
const clickCounter = ref(0);
const onClickOutside = () => {
  if (clickCounter.value === 0 && props.modelValue !== null) {
    clickCounter.value++;
    return;
  }
  showContainer.value = false;
};
const onResize = (el: HTMLElement) => {
  parentEl = containerRef.value?.parentElement;
  handlePosition(parentEl);
};
type TCategory = keyof typeof emojis;
const selectedCategories = ref<TCategory[]>([]);
const onClickCategory = (category: TCategory) => {
  const index = selectedCategories.value.indexOf(category);
  if (index === -1) {
    selectedCategories.value.push(category);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

const filteredEmojis = computed(() => {
  if (selectedCategories.value.length === 0) return emojis;
  const filtered: { [key in TCategory]?: any } = {};
  for (const category of selectedCategories.value) {
    filtered[category] = emojis[category];
  }
  return filtered;
});

function isEnoughSpace(direction: TPositions, parent: HTMLElement) {
  const pickerSpaceX = props.width + ARROW_OFFSET;
  const pickerSpaceY = props.height + ARROW_OFFSET;
  if (direction === "left") {
    const { left } = parent.getBoundingClientRect();
    return left > pickerSpaceX;
  } else if (direction === "right") {
    const { right } = parent.getBoundingClientRect();
    const offsetRight = window.innerWidth - right;
    return offsetRight > pickerSpaceX;
  } else if (direction === "top") {
    const { top } = parent.getBoundingClientRect();
    return top > pickerSpaceY;
  } else if (direction === "bottom") {
    const { top, height } = parent.getBoundingClientRect();
    const bottom = window.innerHeight - top - height;
    return bottom > pickerSpaceY;
  }
}

const onClick = (e: Event) => {
  const el = e.target as HTMLElement;
  const emoji = el.textContent;
  if (el.className !== "emoji" || !emoji) return;

  emit("selectedEmoji", emoji);
  pushToStorage(emoji);
  showContainer.value = false;
};

const hovered = ref(false);
const dimensions = reactive({
  top: 0,
  left: 0,
});
const arrowDimensions = reactive({
  top: 0,
  left: 0,
});
const setDimensions = (el: HTMLElement | null | undefined) => {
  if (!el) return;
  const [offsetX, offsetY] = props.offset;
  const n = props.width / 2 - el.offsetWidth / 2;
  const positionsY = {
    top: el.offsetTop - props.height - offsetY - ARROW_OFFSET,
    bottom: el.offsetTop + el.offsetHeight + offsetY + ARROW_OFFSET,
    left: el.offsetTop + el.offsetHeight / 2 - props.height / 2 + offsetY,
    right: el.offsetTop + el.offsetHeight / 2 - props.height / 2 + offsetY,
    center: 0,
  };
  const positionsX = {
    top: el.offsetLeft - n + offsetX,
    bottom: el.offsetLeft - n + offsetX,
    left: el.offsetLeft - props.width - ARROW_OFFSET,
    right: el.offsetLeft + el.offsetWidth + ARROW_OFFSET,
    center: 0,
  };

  const x = positionsX[pickerPosition.value];
  const y = positionsY[pickerPosition.value];
  const outsideX = window.innerWidth - props.width - x;
  const outsideY = window.innerHeight - props.height - y;
  console.log("", { outsideX, outsideY });

  if (x < 0) {
    dimensions.left = 0;
    arrowDimensions.left = x;
  } else if (outsideX < 0) {
    const X_PADDING = 10;
    dimensions.left = window.innerWidth - props.width - X_PADDING;
    arrowDimensions.left = Math.abs(outsideX) + X_PADDING;
  } else {
    dimensions.left = x;
    arrowDimensions.left = 0;
  }

  dimensions.top = y < 0 ? 0 : y;
  arrowDimensions.top = y < 0 ? y : 0;
};
const onClickParentElement = (e: Event) => {
  e.stopPropagation();
  console.log("onClickParentElement");
  showContainer.value = !showContainer.value;
};

let parentEl: null | undefined | HTMLElement;
onMounted(() => {
  if (props.modelValue !== null) return;
  parentEl = containerRef.value?.parentElement;
  parentEl?.addEventListener("click", onClickParentElement);
});
onBeforeUnmount(() => {
  if (props.modelValue !== null) return;
  parentEl?.removeEventListener("click", onClickParentElement);
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.emoji-picker {
  box-sizing: border-box;

  color: palegreen;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  border-radius: 10px;

  --background-color: #fff;
  --border-color: #e6e6e6;
  --border-radius: 10px;
  --scrollbar-width: 6px;
  --arrow-width: v-bind(ARROW_SIZE);
}
.wrapper {
  border-radius: var(--border-radius);
  overflow: hidden;
  padding-right: 2px;
}
.picker-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  /* -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; */
  position: relative;
  color: #2c3e50;
  padding: 10px;
  padding-right: 2px;
  overflow-y: auto;
  backface-visibility: hidden;
  /* border-radius: var(--border-radius); */
  background: var(--background-color);
  /* box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; */
}
.picker-container {
  width: 100%;
  overflow-y: scroll;
}
/* .emoji-picker__hovered {
  overflow-y: auto;
} */
.picker-container::-webkit-scrollbar {
  width: var(--scrollbar-width);
}

.picker-container::-webkit-scrollbar-track {
  /* box-shadow: inset 0 0 5px grey; */
  /* background-color: #fafafa; */
  /* border-radius: 10px; */
  margin: 10px 0;
}

.picker-container::-webkit-scrollbar-thumb {
  border-radius: var(--border-radius);
  transition: opacity 200ms;
  background-color: #2c3e50;
  opacity: 0;
}
.emoji-picker__hovered .picker-container::-webkit-scrollbar-thumb {
  opacity: 1;
}

header {
  position: relative;
  transform: tran;
}
.arrow-container {
  position: absolute;
  width: 100%;
  height: var(--arrow-width);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-arrow {
  position: relative;
  top: 0;
  background: var(--background-color);
  transform: rotate(45deg) translateY(-50%);
  transform-origin: top;
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}
.arrow-container.arrow-right {
  height: 100%;
  width: var(--arrow-width);
  right: 0;
}
.arrow-container.arrow-left {
  height: 100%;
  width: var(--arrow-width);
  left: 0;
}
.arrow-container.arrow-bottom {
  height: var(--arrow-width);
  width: 100%;
  bottom: 0;
}
.arrow-container.arrow-left .picker-arrow {
  transform: rotate(45deg) translateX(-50%);
  transform-origin: left;
  border: none;
  border-left: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}
.arrow-container.arrow-right .picker-arrow {
  transform: rotate(45deg) translateX(50%);
  transform-origin: right;
  border: none;
  border-right: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}
.arrow-container.arrow-bottom .picker-arrow {
  transform: rotate(45deg) translateY(50%);
  transform-origin: bottom;
  border: none;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.picker-arrow.arrow-none {
  display: none;
}
.scrollbar-hider {
  position: absolute;
  height: calc(100% - 6px);
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  background-color: var(--background-color);
  right: 0;
  z-index: 10;
  border-bottom-right-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
  pointer-events: none;
  transition: opacity 180ms;
}
.scrollbar-hider__invisible {
  opacity: 0;
}

.picker-input {
  width: 100%;
  background-color: #fafafa;
  border: none;
  border-radius: 5px;
  height: 30px;
  padding: 10px;
  color: #2b3e50;
}
.picker-input::placeholder {
  color: #d4d4d4;
}
.picker-input__icon {
  position: absolute;
  width: 20px;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}
.picker-input__icon svg {
  display: block;
}
.picker-input:focus {
  outline: 1px #e5e5e5 solid;
}

.section-category {
  /* margin-top: 15px; */
}
section {
  position: relative;
}
.emoji-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: #fafafa;
  border-radius: 5px;
  padding: 4px;
}
.emoji-container.special {
  background-color: #f7b4fa21;
}

.category-name {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #dcdcdc;
  text-transform: lowercase;
  text-align: right;
}
.category-name.special {
  color: #ffc7ff;
}
.emoji {
  background-color: transparent;
  border-radius: 40%;
  width: 27.4px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1px;
  cursor: pointer;
  font-size: 24px;
}
.emoji:hover {
  /* background-color: #ffc7ff; */
  background: linear-gradient(0deg, rgb(255 194 255) 10%, rgba(0, 0, 0, 0) 90%);
}

.container-enter-active,
.container-leave-active {
  transition: opacity 0.3s;
}

.container-enter-from,
.container-leave-to {
  opacity: 0;
}

.section-categories {
  /* display: flex; */
  /* flex-wrap: wrap; */
}
.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
  justify-items: center;
  gap: 1px;
}
.category-item {
  font-size: 12px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}
.category-item:hover,
.category-item.selected {
  background-color: blueviolet;
}
</style>
