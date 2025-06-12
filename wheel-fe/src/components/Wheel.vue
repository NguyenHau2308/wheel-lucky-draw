<template>
  <div class="wheel-container">
    <div
      class="wheel"
      :style="{ transform: `rotate(${angle}deg)` }"
    >
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const codes = ref([]);
const angle = ref(0);

const fetchCodes = async () => {
  const { data } = await axios.get(
    "http://localhost:4000/participants"
  );
  codes.value = data;
};

onMounted(async () => {
  await fetchCodes();
  setInterval(fetchCodes, 30000); // 30 s
  // idle spin
  setInterval(() => (angle.value += 0.3), 16);
});

const sliceStyle = (idx) => {
  const deg = (360 / codes.value.length) * idx;
  return {
    transform: `rotate(${deg}deg) translateY(-50%)`,
  };
};
</script>

<style scoped>
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
  transition: transform 5s cubic-bezier(0.2, 0, 0.1, 1);
}
.slice {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 0 0;
  font-size: 10px;
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
