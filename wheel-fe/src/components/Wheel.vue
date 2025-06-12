<template>
  <div class="wheel-container">
    <div class="wheel" :style="{ transform: `rotate(${angle}deg)` }">
      <div
        v-for="(code, idx) in codes"
        :key="code"
        class="slice"
        :style="sliceStyle(idx)"
      >
        {{ code }}
      </div>
    </div>
    <div class="indicator"></div>
    <div v-if="winner" class="winner">{{ winner }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { io } from "socket.io-client";

const API = "http://localhost:4000";

const codes = ref([]);
const angle = ref(0);
const spinning = ref(false);
const winner = ref("");

let idleTimer = null;

// ­──── fetch danh sách mã ─────────────────────────
const fetchCodes = async () => {
  const { data } = await axios.get(`${API}/participants`);
  codes.value = data;
};

// ­──── idle spin (quay chậm liên tục) ─────────────
const startIdle = () => {
  idleTimer = setInterval(() => {
    if (!spinning.value) angle.value += 0.3;
  }, 16);
};

// ­──── handle sự kiện DRAW ────────────────────────
const socket = io(API);

const handleDraw = async () => {
  if (spinning.value || codes.value.length === 0) return;
  spinning.value = true;
  clearInterval(idleTimer);

  // chọn winner ngẫu nhiên
  const winnerIdx = Math.floor(Math.random() * codes.value.length);
  const winnerCode = codes.value[winnerIdx];

  // xoay 10 vòng + canh winner về đầu (indicator)
  const sliceDeg = 360 / codes.value.length;
  const targetDeg = 360 * 10 - winnerIdx * sliceDeg;
  angle.value = targetDeg; // CSS transition sẽ animate

  // 20 s (đủ thời gian quay chậm dần) rồi gửi kết quả
  setTimeout(async () => {
    await axios.post(`${API}/draw-result`, {
      winner: winnerCode,
      draw_time: new Date().toISOString().slice(0, 19).replace("T", " "),
    });

    winner.value = winnerCode; // hiển thị
    setTimeout(() => (winner.value = ""), 30000); // ẩn sau 30 s

    spinning.value = false;
    startIdle();
  }, 20000);
};

// ­──── lifecycle ─────────────────────────────────
onMounted(async () => {
  await fetchCodes();
  setInterval(fetchCodes, 30000); // refresh list 30 s/lần
  startIdle();
  socket.on("draw-now", handleDraw);
});

onUnmounted(() => {
  clearInterval(idleTimer);
  socket.off("draw-now", handleDraw);
});

// ­──── style cho từng slice ───────────────────────
const sliceStyle = (idx) => {
  const deg = (360 / codes.value.length) * idx;
  return {
    transform: `rotate(${deg}deg) translateY(-50%)`,
  };
};
</script>

<style scoped>
.winner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 10px #000;
}
.wheel-container {
  position: relative;
  width: 600px;
  height: 600px;
  margin: auto;
}
.wheel {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 8px solid #ccc;
  transition: transform 18s cubic-bezier(0.22, 0.61, 0.36, 1); /* mượt hơn */
}
.slice {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 0 0;
  font-size: 10px;
  white-space: nowrap;
}
.indicator {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 25px solid red;
}
</style>
