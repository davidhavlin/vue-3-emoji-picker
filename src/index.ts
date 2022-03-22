import { App } from "vue";
import EmojiPicker from "./components/EmojiPicker.vue";

export default {
  install: (app: App) => {
    app.component("EmojiPicker", EmojiPicker);
  },
};
