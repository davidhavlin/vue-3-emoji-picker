import EmojiPicker from "./components/EmojiPicker.vue";

export default {
  install: (app, options) => {
    app.component("EmojiPicker", EmojiPicker);
  },
};
