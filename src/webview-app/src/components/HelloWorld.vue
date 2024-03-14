<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1 class="title">{{ msg }}</h1>

  <div class="title">👏欢迎使用小废物！</div>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>

  </div>

  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: black;
}

.title {
  color: black;
}
</style>
