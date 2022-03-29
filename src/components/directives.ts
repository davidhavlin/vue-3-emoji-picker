import { Directive } from "vue";

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
export const vClickOutside: Directive = {
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

export const vOnResize: Directive = {};
