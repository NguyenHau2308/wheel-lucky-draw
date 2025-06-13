<template>
  <div class="wrap">
    <div class="wheel-box">
      <LuckyWheel
        ref="wh"
        :width="600"
        :height="600"
        :blocks="wheelBlocks"
        :prizes="prizeList"
        :buttons="buttons"
        @end="onEnd"
      />
      <button
        class="spin-btn"
        :disabled="busy"
        @click="draw"
      >SPIN</button>
    </div>
    <div v-if="winner" class="winner">{{ winner }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { LuckyWheel } from '@lucky-canvas/vue'
import axios from 'axios'

const API = 'http://localhost:4000'
const wh = ref(null)
const prizeList = ref([])
const busy = ref(false)
const winner = ref('')

const wheelBlocks = [
  { padding: '20px', background: '#fff', borderRadius: 300 }
]
const buttons = [{
  radius: '60px',
  background: '#ff9800',
  pointer: true,
  fonts: [{ text: 'SPIN', fontColor: '#fff', fontSize: 20 }]
}]

async function loadCodes () {
  const { data } = await axios.get(`${API}/participants`)
  if (data.length !== prizeList.value.length) {
    prizeList.value = data.map(code => ({
      background: `hsl(${Math.random()*360},70%,50%)`,
      fonts: [{ text: code, top: 20 }]
    }))
  }
}

onMounted(async () => {
  await loadCodes()
  setInterval(loadCodes, 30000)
  // Quay chậm khi vào trang
  nextTick(() => wh.value.play(2))
})

function draw () {
  if (busy.value) return
  busy.value = true
  // Quay nhanh
  wh.value.play(18)
  const idx = Math.floor(Math.random() * prizeList.value.length)
  wh.value.stop(idx)
}

async function onEnd (prize) {
  winner.value = prize.fonts[0].text
  await axios.post(`${API}/draw-result`, {
    winner: winner.value,
    draw_time: new Date().toISOString().slice(0,19).replace('T',' ')
  })
  setTimeout(() => {
    winner.value = ''
    busy.value = false
    wh.value.play(2)    // lại quay chậm
  }, 30000)
}
</script>

<style scoped>
.wrap{display:flex;flex-direction:column;align-items:center;gap:20px}
.wheel-box{position:relative}
.spin-btn{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  padding:30px 60px;font-size:32px;font-weight:700;border-radius:50px;
  background:#ff9800;color:#fff;border:none;cursor:pointer;z-index:2;opacity:0.96
}
.spin-btn:disabled{opacity:0.5;cursor:not-allowed}
.winner{
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  font-size:48px; font-weight:700; color:#ffd700; text-shadow:0 0 10px #000;
}
</style>
