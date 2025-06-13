<template>
  <div class="wheel-wrapper">
    <div class="reel-box">
      <ul
        ref="reel"
        class="reel"
        :style="{ transform: `translateY(${offset}px)` }"
      >
        <li
          v-for="(c, i) in repeated"
          :key="`${c}-${i}`"
          class="item"
          :style="{ background: colors[i % colors.length] }"
        >
          {{ c }}
        </li>
      </ul>

      <div class="window">
        <span class="arrow arrow-left"></span>
        <span class="arrow arrow-right"></span>
      </div>
    </div>

    <button class="spin-btn" @click="spin" :disabled="state !== 'idle'">
      QUAY
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import axios from "axios";

const codes = ref([]);
const offset = ref(0);
const state = ref("idle");
const itemH = ref(0);
const reel = ref(null);
const colors = ["#ffeb3b", "#00e5ff", "#ff4081", "#76ff03", "#ff5722"];

const getCodes = () =>
  axios
    .get("http://localhost:4000/participants")
    .then((r) => (codes.value = r.data));
const repeated = computed(() => [
  ...codes.value,
  ...codes.value,
  ...codes.value,
]);

let idleTimer;
const startIdle = () => {
  idleTimer = setInterval(() => {
    offset.value = (offset.value - 1) % (itemH.value * codes.value.length);
  }, 16);
};
const stopIdle = () => clearInterval(idleTimer);

const spin = async () => {
  if (state.value !== "idle") return;
  state.value = "running";
  stopIdle();

  const idx = Math.floor(Math.random() * codes.value.length);
  const loops = 6;
  const total = codes.value.length * itemH.value;
  const target =
    -(loops * total + idx * itemH.value) + (windowH / 2 - itemH.value / 2);

  reel.value.style.transition = "transform 22s cubic-bezier(.1,.9,.3,1)";
  offset.value = target;
  reel.value._winner = codes.value[idx];
};

const onStop = async () => {
  if (state.value !== "running") return;
  state.value = "winner";

  await axios.post("http://localhost:4000/draw-result", {
    winner: reel.value._winner,
    draw_time: new Date().toISOString(),
  });

  setTimeout(() => {
    reel.value.style.transition = "";
    state.value = "idle";
    startIdle();
  }, 30000);
};

let windowH;
onMounted(async () => {
  await getCodes();
  nextTick(() => {
    itemH.value = reel.value.querySelector(".item").offsetHeight;
    windowH = document.querySelector(".window").offsetHeight;
    startIdle();
  });
  setInterval(getCodes, 30000);
});
</script>

<style scoped>
.wheel-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  height: 100vh;
  justify-content: center;
}

.reel-box {
  position: relative;
  width: 240px;
  height: 480px;
  background: #0047b3;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 0 10px #0005 inset;
}

.reel {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: bold 32px/1 "Roboto", sans-serif;
  color: #fff;
}

.color-0 {
  color: #ffeb3b;
} /* vàng */
.color-1 {
  color: #00e5ff;
} /* cyan */
.color-2 {
  color: #ff4081;
} /* hồng */
.color-3 {
  color: #76ff03;
} /* xanh lá */
.color-4 {
  color: #ff5722;
} /* cam */

.window {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 64px;
  margin-top: -32px;
  border: 3px solid #ff0000;
  box-sizing: border-box;
  pointer-events: none;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 12px solid transparent;
  border-bottom: 12px solid transparent;
  z-index: 10;
}

.arrow-left {
  left: -10px;
  border-left: 20px solid #000;
}

.arrow-right {
  right: -10px;
  border-right: 20px solid #000;
}

.spin-btn {
  padding: 10px 40px;
  font-size: 20px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  background: #222;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.spin-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.spin-btn:not(:disabled):hover {
  background: #444;
}
</style>