<template>
  <div class="page">
    <header class="topbar">
      <h1 class="logo">Wheel Lucky Draw</h1>
    </header>

    <section class="banner">
      <div class="workspace">
        <Wheel class="wheel-box" />

        <aside class="panel">
          <h2 class="panel-title">Danh sách ({{ codes.length }})</h2>

          <form @submit.prevent="addCode" class="add-form">
            <input v-model="newCode" placeholder="Nhập mã…" />
            <button type="submit">Thêm</button>
          </form>

          <ul class="code-list">
            <li v-for="c in codes" :key="c">
              {{ c }}
              <button @click="remove(c)">✕</button>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <footer class="bottombar"></footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Wheel from "./components/Wheel.vue";

const codes = ref(["A0001", "A0002", "A0003"]);
const newCode = ref("");

function addCode() {
  const s = newCode.value.trim();
  if (!s) return;
  if (!codes.value.includes(s)) codes.value.push(s);
  newCode.value = "";
}
function remove(c) {
  codes.value = codes.value.filter((x) => x !== c);
}
</script>

<style scoped>
body {
  margin: 0;
  font-family: Inter, sans-serif;
  background: #1b1b1b;
  color: #eee;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  width: 100%;
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px #0002;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
.logo {
  font-size: 22px;
  font-weight: 700;
  color: #222;
}

.banner {
  flex: 1;
  background: #c7d0bf;
  padding: -10px 0 60px;
}

.bottombar {
  width: 100%;
  height: 56px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 -2px 4px #0002;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
}
.workspace {
  width: 2000px;
  max-width: 95%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 64px;
  min-height: calc(100vh - 56px - 56px - 140px);
}

.wheel-box {
  flex-shrink: 0;
}

.panel {
  height: 435px;
  width: 480px;
  background: #fff;
  color: #222;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 12px #0003;
  display: flex;
  flex-direction: column;
  margin-top: -68px;
}
.panel-title {
  margin: 0 0 16px;
  font-size: 20px;
  text-align: center;
}

.add-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.add-form input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-form button {
  padding: 6px 14px;
  background: #2f5b58;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.code-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow: auto;
}
.code-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #eee;
}
.code-list li button {
  background: none;
  border: none;
  color: #c00;
  cursor: pointer;
}

.footer {
  height: 40px;
  background: #ffffff;
}
</style>