<template>
  <div class="test-container">
    <section>
      <button @click="test = !test" style="margin-left: -39px">
        {{ test }}
        click to open
        <!-- <emoji-picker /> -->
      </button>
    </section>
    <button class="test-btn" style="margin-left: -39px">
      click to open2
      <emoji-picker @selected-emoji="addEmoji" />
    </button>
    <textarea v-model="text" name="" id="" cols="30" rows="10"></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EmojiPicker from "./components/EmojiPicker/EmojiPicker.vue";

const test = ref(false);
const text = ref("test text");

const addEmoji = (emoji: string) => {
  text.value += emoji;
};
</script>

<style>
/* * {
  box-sizing: border-box;
} */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.test-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.test-btn {
  position: absolute;
  right: 30px;
  top: 20px;
}
</style>
