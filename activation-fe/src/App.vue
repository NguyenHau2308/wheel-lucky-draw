<template>
  <div class="wrapper">
    <button :disabled="busy" class="start" @click="start">
      {{ busy ? "WAIT..." : "START" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
const busy = ref(false);

const start = () => {
  busy.value = true;
  socket.emit("start-draw");
  setTimeout(() => (busy.value = false), 30000); // unlock sau 30 s
};
</script>

<style>
.wrapper {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
}
.start {
  font-size: 4rem;
  padding: 1rem 2rem;
  border-radius: 16px;
}
.start[disabled] {
  opacity: 0.5;
}
</style>
