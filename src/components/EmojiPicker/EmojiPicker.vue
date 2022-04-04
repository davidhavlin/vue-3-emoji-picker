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
            :style="{
              transform: `translate(${arrowDimensions.left}px, ${arrowDimensions.top}px) translateZ(0)`,
            }"
          >
            <div
              class="picker-arrow2"
              :class="[ARROW_POSITION[pickerPosition]]"
              :style="{ width: ARROW_SIZE + 'px', height: ARROW_SIZE + 'px' }"
            ></div>
          </div>
          <div
            class="picker-arrow"
            :class="[ARROW_POSITION[pickerPosition]]"
            :style="{ width: ARROW_SIZE + 'px', height: ARROW_SIZE + 'px' }"
          ></div>
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
                    :title="desc"
                    class="emoji"
                  >
                    {{ emoji }}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, reactive } from "vue";
import emojis from "./emojis";
import { vClickOutside, vOnResize } from "./directives";

type TPositions = "top" | "bottom" | "left" | "right" | "center";

interface Props {
  placeholder?: string;
  modelValue?: boolean;
  width?: number;
  height?: number;
  searching?: boolean;
  position?: TPositions;
  offset?: number[];
  showArrow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Search emojis...",
  modelValue: undefined,
  width: 240,
  height: 250,
  searching: true,
  position: "left",
  offset: () => [0, 0],
  showArrow: true, // todo change later
});
const emit = defineEmits(["selectedEmoji"]);

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

const showContainer = ref(true);

const onClickOutside = () => {
  showContainer.value = false;
};
const onResize = (el: HTMLElement) => {
  const { left, right } = el.getBoundingClientRect();
  console.log("", { left, right });
  parentEl = containerRef.value?.parentElement;
  if (!parentEl) return;
  const directions: { [key in TPositions]: TPositions[] } = {
    left: ["left", "right", "bottom", "top"],
    right: ["right", "left", "bottom", "top"],
    top: ["top", "bottom", "left", "right"],
    bottom: ["bottom", "top", "left", "right"],
    center: ["center"],
  };

  for (const way of directions[props.position]) {
    if (isEnoughSpace(way, parentEl)) {
      pickerPosition.value = way;
      setDimensions(parentEl);
      break;
    }
  }
};

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

// function debounce(func, timeout = 300){
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => { func.apply(this, args); }, timeout);
//   };
// }

const onClick = (e: Event) => {
  const el = e.target as HTMLElement;
  if (el.className !== "emoji") return;

  emit("selectedEmoji", el.textContent);
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
  // const {
  //   marginLeft,
  //   marginTop,
  //   width: computedWidth,
  //   height: computedHeight,
  // } = window.getComputedStyle(el);
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
  let finalTop;
  // if (pickerPosition.value === "bottom") {
  //   finalTop = el.offsetTop + el.offsetHeight + offsetY + ARROW_OFFSET;
  // } else if (picker)

  const x = positionsX[pickerPosition.value];
  const y = positionsY[pickerPosition.value];
  const outerSpace = window.innerWidth - props.width - x;

  if (x < 0) {
    dimensions.left = 0;
    arrowDimensions.left = x;
  } else if (outerSpace < 0) {
    dimensions.left = window.innerWidth - props.width;
    arrowDimensions.left = Math.abs(outerSpace);
  } else {
    dimensions.left = x;
    arrowDimensions.left = 0;
  }

  // dimensions.left = x < 0 ? 0 : x;
  dimensions.top = y < 0 ? 0 : y;
  arrowDimensions.top = y < 0 ? y : 0;
  // arrowDimensions.left = x < 0 ? x : 0;

  console.log("", { outerSpace, x, hm: outerSpace > x });
};
const onClickParentElement = (e: Event) => {
  e.stopPropagation();
  showContainer.value = !showContainer.value;
};

const containerRef = ref<HTMLElement | null>(null);
let parentEl: null | undefined | HTMLElement;
onMounted(() => {
  // props.modelValue;
  parentEl = containerRef.value?.parentElement;
  setDimensions(parentEl);
  console.log("mounted", containerRef.value?.parentElement);
  parentEl?.addEventListener("click", onClickParentElement);
});
onBeforeUnmount(() => {
  console.log("unm", parentEl);
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
  height: 0px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-arrow2 {
  position: relative;
  top: 0;
  background: #fff;
  transform: rotate(45deg);
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}
.picker-arrow {
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%) rotate(45deg);
  left: 50%;
  background: #fff;
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}
.picker-arrow.arrow-bottom {
  top: unset;
  border: none;
  bottom: 0;
  transform: translate(-50%, 50%) rotate(45deg);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}
.picker-arrow.arrow-left {
  top: 50%;
  left: 0;
  border: none;
  transform: translate(-50%, -50%) rotate(45deg);
  border-left: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}
.picker-arrow.arrow-right {
  top: 50%;
  left: unset;
  right: 0;
  border: none;
  transform: translate(50%, -50%) rotate(45deg);
  border-right: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
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
</style>
