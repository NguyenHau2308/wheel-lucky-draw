<template>
  <div class="wheel-wrapper">
    <div class="reel-box">
      <ul
        ref="reel"
        class="reel"
        :style="{ transform: `translateY(${offset}px)` }"
        @transitionend="onStop"
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

      <div class="window" :class="{ winner: state === 'winner' }">
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
import confetti from "canvas-confetti";
import { Howl } from "howler";
import dayjs from "dayjs";

const tickSound = new Howl({ src: ["/sounds/tick.mp3"], volume: 0.5 });
const winSound = new Howl({ src: ["/sounds/win.mp3"], volume: 1 });

const codes = ref([]);
const offset = ref(0);
const state = ref("idle");
const itemH = ref(0);
const reel = ref(null);
const colors = ["#ffeb3b", "#00e5ff", "#ff4081", "#76ff03", "#ff5722"];
const LOOPS = 6;
let boxH = 0;
let windowH = 0;

const fetchCodes = () =>
  axios
    .get("http://localhost:4000/participants")
    .then((res) => (codes.value = res.data));

const repeated = computed(() => {
  const arr = [];
  for (let i = 0; i < LOOPS + 2; i++) arr.push(...codes.value);
  return arr;
});

let idleTimer;
const startIdle = () => {
  idleTimer = setInterval(() => {
    offset.value = (offset.value - 1) % (itemH.value * codes.value.length);
  }, 16);
};
const stopIdle = () => clearInterval(idleTimer);

const spin = () => {
  if (state.value !== "idle") return;
  stopIdle();
  state.value = "running";

  const idx = Math.floor(Math.random() * codes.value.length);
  reel.value._winner = codes.value[idx];

  const total = codes.value.length * itemH.value;
  const BOX_C = boxH / 2 - itemH.value / 2;
  const target = -(LOOPS * total + idx * itemH.value) + BOX_C;

  reel.value.style.transition = "transform 22s cubic-bezier(.1,.9,.3,1)";
  const offsetStart = offset.value;
  offset.value = target;

  let lastStep = Math.floor(offsetStart / itemH.value);
  let start = null;

  const trackTick = (timestamp) => {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const t = Math.min(progress / 22000, 1);
    const ease = 1 - Math.pow(1 - t, 2);
    const currentOffset = offsetStart + (target - offsetStart) * ease;
    const currentStep = Math.floor(currentOffset / itemH.value);

    if (currentStep !== lastStep) {
      lastStep = currentStep;
      tickSound.play();
    }

    if (progress < 22000) {
      requestAnimationFrame(trackTick);
    }
  };

  requestAnimationFrame(trackTick);
};

// const fmt = (d) => d.toISOString().slice(0, 19).replace("T", " ");

const onStop = async () => {
  if (state.value !== "running") return;
  state.value = "winner";

  setTimeout(() => {
    Howler.stop();
    winSound.play();
  }, 100);

  const center = boxH / 2 - itemH.value / 2;
  const idxFinal =
    Math.round((center - offset.value) / itemH.value) % codes.value.length;
  const winner =
    codes.value[(idxFinal + codes.value.length) % codes.value.length];

  const duration = 30000;
  const end = Date.now() + duration;

  const burst = () => {
    for (let i = 0; i < 5; i++) {
      confetti({
        particleCount: 30,
        angle: 60 + i * 15,
        spread: 55,
        origin: { x: 0.5, y: 0.5 },
        gravity: 0.6,
        ticks: 200,
        scalar: 1.1,
      });
    }
  };

  const rain = () => {
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 70,
      origin: { x: Math.random(), y: 0 },
      gravity: 1,
      ticks: 300,
      scalar: 0.8,
    });
    if (Date.now() < end) requestAnimationFrame(rain);
  };

  burst();
  rain();

  await axios.post("http://localhost:4000/draw-result", {
    winner,
    draw_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  });

  setTimeout(() => {
    reel.value.style.transition = "";
    state.value = "idle";
    startIdle();
  }, 30_000);
};

onMounted(async () => {
  await fetchCodes();
  nextTick(() => {
    itemH.value = reel.value.querySelector(".item").offsetHeight;
    windowH = document.querySelector(".window").offsetHeight;
    boxH = document.querySelector(".reel-box").clientHeight;
    startIdle();
  });
  setInterval(fetchCodes, 30_000);
});
</script>

<style scoped>
@keyframes flash {
  0%,
  100% {
    box-shadow: 0 0 0 3px #fff;
  }
  50% {
    box-shadow: 0 0 10px 3px #ff0;
  }
}
.window.winner {
  animation: flash 0.6s infinite;
}
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