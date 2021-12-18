<template>
  <div class="m-4" v-if="state === 'before-play'">
    <input
      v-model="name"
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline select-none"
    />
    <ul>
      <li v-for="name in namelist" :key="name">
        {{ name }}
      </li>
    </ul>
    <button
      @click="start()"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
    >
      ゲーム開始
    </button>
  </div>
  <div v-if="state === 'game'">
    <h2>スコアボード</h2>
    <ul>
      <li v-for="name in namelist" :key="name">
        {{ name }}
      </li>
    </ul>
    <div class="flex flex-wrap card-container">
      <div
        v-for="(card, index) in cards"
        class="m-2 shadow-lg rounded border-solid border-2 border-gray-300"
        :class="{
          cardbg: !card.mkr,
          'opacity-0': card.hide,
          'cursor-pointer': !card.hide,
        }"
        @click="mekuru(index)"
        style="height: 70px; width: 50px"
      >
        <div v-if="card.mkr" class="txt-cont">
          {{ card.label }}
        </div>
      </div>
    </div>
  </div>
  <div v-if="state === 'result'">
    <ul>
      <li v-for="name in namelist" :key="name">
        {{ name }}
      </li>
    </ul>
    <button
      @click="totitle()"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
    >
      もう1度プレイする
    </button>
  </div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/ban-ts-comment: 0 */
/* eslint vue/require-v-for-key: 0 */
/* eslint vue/no-unused-vars: 0 */
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Card, State } from "../types/state";
import { io } from "socket.io-client";

const socket = io(
  process.env.NODE_ENV == "production" ? "/" : "ws://localhost:3000/"
);
let isMyTurn = false;
socket.on("namelist", (_namelist: string[]) => {
  namelist.value = _namelist;
});
socket.on("start", () => {
  state.value = "game";
  resetCard();
});
socket.on("yourturn", () => {
  console.log("myturn");
  isMyTurn = true;
});
socket.on("finish", () => {
  state.value = "result";
  isMyTurn = false;
});

let stock: [string, number][] = [];

socket.on("mkr", (index: number, label: string) => {
  if (_phase === 0) {
    cards[index].mkr = true;
    cards[index].label = label;
    stock.push([label, index]);
    _phase = 1;
  } else if (_phase === 1) {
    cards[index].mkr = true;
    cards[index].label = label;
    stock.push([label, index]);
    _phase = 2;
  } else {
    cards.forEach((card) => {
      card.mkr = false;
    });
    _phase = 0;
    if (stock[0][0].charAt(2) === stock[1][0].charAt(2)) {
      if (isMyTurn) {
        socket.emit("success");
      }
      cards[stock[0][1]].hide = true;
      cards[stock[1][1]].hide = true;
    } else {
      if (isMyTurn) {
        socket.emit("nextTurn");
        isMyTurn = false;
      }
    }
    stock = [];
  }
});

const state = ref<State>("before-play");
const name = ref<string>("");
const namelist = ref<string[]>([]);

onMounted(() => {
  console.log("Component is mounted!");
});

watch(name, () => {
  socket.emit("name", name.value);
});

function totitle(): void {
  state.value = "before-play";
}

function start(): void {
  socket.emit("start");
  state.value = "game";
  resetCard();
}

let cards = reactive<Card[]>([]);

/* function resetCard(): void {
  cards = cards.fill({
    label: "",
    mkr: false,
    hide: false,
  });
} */
function resetCard(): void {
  cards.splice(0);
  for (let i = 0; i < 53; i++) {
    cards.push({
      label: "",
      mkr: false,
      hide: false,
    });
  }
}

let _phase = 0;

function mekuru(index: number) {
  if (isMyTurn && (!cards[index].mkr || _phase === 2) && !cards[index].hide) {
    socket.emit("mkr", index);
  }
}
</script>

<style>
.cardbg {
  background: repeating-linear-gradient(
    45deg,
    red,
    red 5px,
    white 5px,
    white 10px
  );
}
.card-container {
  width: 700px;
  margin: auto;
}
.txt-cont {
  justify-content: center;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 25px;
}
</style>
