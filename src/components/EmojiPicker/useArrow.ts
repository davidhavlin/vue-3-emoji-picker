import { computed } from "vue";

export function useArrow() {
  const ARROW_SIZE = 13;
  // const ARROW_OFFSET = props.showArrow ? (Math.sqrt(2) * ARROW_SIZE) / 2 : 0;

  // const test = computed(() => {
  //   return ["left", "right"].includes(pickerPosition.value)
  //     ? { width: ARROW_OFFSET + "px" }
  //     : { height: ARROW_OFFSET + "px" };
  // });

  const ARROW_POSITION = {
    top: "arrow-bottom",
    bottom: "arrow-top",
    left: "arrow-right",
    right: "arrow-left",
    center: "arrow-none",
  };

  return {};
}
