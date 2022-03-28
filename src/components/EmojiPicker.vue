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
            width: width + 'px',
            height: height + 'px',
          }"
          v-click-outside="onClickOutside"
          @mouseenter="hovered = true"
          @mouseleave="hovered = false"
        >
          <header v-if="props.searching">
            <input
              class="picker-input"
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

          <section class="section-used">
            <div class="category-name special">Last used</div>
            <div class="emoji-container special">
              <div class="emoji">😉</div>
              <div class="emoji">😉</div>
              <div class="emoji">😉</div>
            </div>
          </section>

          <section>categories</section>

          <section
            v-for="(category, name) in emojis"
            :key="name"
            class="section-category"
          >
            <div class="category-name">{{ name }}</div>
            <div class="emoji-container">
              <div
                v-for="(emoji, desc) in category"
                :key="desc"
                class="emoji"
                @click="onClick(emoji)"
              >
                {{ emoji }}
              </div>
            </div>
          </section>
        </main>
      </transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, Directive, onMounted, onBeforeUnmount, reactive } from "vue";
import emojis from "./emojis";

interface Props {
  placeholder?: string;
  modelValue?: boolean;
  width?: number;
  height?: number;
  searching?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Search emojis...",
  modelValue: undefined,
  width: 240,
  height: 390,
  searching: true,
});
const emit = defineEmits([]);

const checkIfClickOutside = (
  e: Event,
  emojiContainer: HTMLElement,
  cb: () => void
) => {
  if (
    emojiContainer !== e.target &&
    !emojiContainer.contains(e.target as Node)
  ) {
    cb();
  }
};
let handler: any;
const vClickOutside: Directive = {
  beforeMount: (el: HTMLElement, { value: callback }) => {
    handler = (e: Event) => checkIfClickOutside(e, el, callback);
    document.addEventListener("click", handler);
    document.addEventListener("touchstart", handler);
  },
  beforeUnmount: (el: HTMLElement) => {
    console.log("unmount", { el });
    document.removeEventListener("click", handler);
    document.removeEventListener("touchstart", handler);
  },
};

const showContainer = ref(true);

const onClickOutside = () => {
  showContainer.value = false;
};

// function debounce(func, timeout = 300){
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => { func.apply(this, args); }, timeout);
//   };
// }
const onClick = (emoji: string) => {
  console.log("", emoji);
};

const hovered = ref(false);
const dimensions = reactive({
  top: 0,
  left: 0,
});
const setDimensions = (el: HTMLElement | null | undefined) => {
  if (!el) return;
  const {
    marginLeft,
    marginTop,
    width: computedWidth,
    height: computedHeight,
  } = window.getComputedStyle(el);
  const nieco = containerRef.value?.offsetWidth;
  console.log({ nieco });
  const n = props.width / 2 - el.offsetWidth / 2;
  console.log("COMPUTED", {
    marginLeft,
    marginTop,
    computedWidth,
    computedHeight,
    offsetLeft: el.offsetLeft,
    offsetTop: el.offsetTop,
    h: el.offsetHeight,
  });
  dimensions.top = el.offsetTop + el.offsetHeight;
  dimensions.left = el.offsetLeft - n;
};
const onClickParent = (e: Event) => {
  e.stopPropagation();
  showContainer.value = !showContainer.value;
};

const containerRef = ref<HTMLElement | null>(null);
let parentEl: null | undefined | HTMLElement;
onMounted(() => {
  props.modelValue;
  parentEl = containerRef.value?.parentElement;
  setDimensions(parentEl);
  console.log("mounted", containerRef.value?.parentElement);
  parentEl?.addEventListener("click", onClickParent);
});
onBeforeUnmount(() => {
  console.log("unm", parentEl);
  parentEl?.removeEventListener("click", onClickParent);
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.emoji-picker {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  padding: 10px;
  /* overflow-y: hidden; */
  overflow-y: auto;
  backface-visibility: hidden;
  border-radius: 10px;
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}
/* .emoji-picker__hovered {
  overflow-y: auto;
} */
.emoji-picker::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker::-webkit-scrollbar-track {
  /* box-shadow: inset 0 0 5px grey; */
  /* background-color: #fafafa; */
  /* border-radius: 10px; */
}

.emoji-picker::-webkit-scrollbar-thumb {
  background: #2c3e50;
  border-radius: 10px;
}

header {
  position: relative;
  transform: tran;
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
  margin-top: 15px;
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
  text-transform: uppercase;
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
  font-size: 20px;
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
</style>
