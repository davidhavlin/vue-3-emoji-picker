import { ref } from "vue";

export function usePosition() {
  const top = ref(0);
  const left = ref(0);

  // const setDimensions = (el: HTMLElement | null | undefined) => {
  //   if (!el) return;
  //   const [offsetX, offsetY] = props.offset;
  //   const diagonal = props.showArrow ? getDiagonal(ARROW_SIZE) : 0;
  //   // const {
  //   //   marginLeft,
  //   //   marginTop,
  //   //   width: computedWidth,
  //   //   height: computedHeight,
  //   // } = window.getComputedStyle(el);
  //   const nieco = containerRef.value?.offsetWidth;
  //   console.log({ nieco });
  //   const n = props.width / 2 - el.offsetWidth / 2;
  //   dimensions.top = el.offsetTop + el.offsetHeight + offsetY + diagonal / 2;
  //   dimensions.left = el.offsetLeft - n + offsetX;
  // };
}
