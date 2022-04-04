<template>
  <div class="test-container">
    <section>
      <button style="margin-left: -39px">
        click to open
        <emoji-picker />
      </button>
    </section>
    <button class="test-btn" style="margin-left: -39px">
      click to open2
      <emoji-picker />
    </button>
  </div>
</template>

<script setup lang="ts">
import EmojiPicker from "./components/EmojiPicker/EmojiPicker.vue";
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
