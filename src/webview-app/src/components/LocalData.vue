<script setup>
import { ref } from 'vue'
import { ExtensionCommunicator } from '../ExtensionCommunicator.js';
const communicator = ExtensionCommunicator.getInstance();

defineProps({
  msg: String,
})

const localData = ref({})

const getAllLocalData = () => {
  console.log('getAllLocalData')
  communicator.sendMessage({ command: 'getAllStorage', params: {} }, (result) => {
    if (result.code == 0) {
      console.log('result', result);
      localData.value = result.data;
    } else {
      console.log('失败', result);
    }
  });
}

const setData = () => {
  console.log('setData')
  communicator.sendMessage({ command: 'setStorage', params: {
    key: 'test',
    value: 'dahuang haolihai'
  }});
}

const handleT = () => {
  console.log('handleT')
  communicator.sendMessage({ command: 'handleT', params: {
    key: 'test',
    value: 'dahuang haolihai'
  }});
}

const getData = () => {
  console.log('getData')
  communicator.sendMessage({ command: 'getStorage', params: {
    key: 'test'
  } }, (result) => {
    if (result.code == 0) {
      console.log('result', result);
      localData.value = result.data;
    } else {
      console.log('失败', result);
    }
  });
}

</script>

<template>
  <button @click="getAllLocalData">获取本地存储的信息</button>
  <br>
  <button @click="setData">设置信息</button>
  <br>
  <button @click="getData">获取信息</button>
  <br>
  <button @click="handleT">ttt</button>



  <div class="color">{{ localData  }}</div>
</template>

<style scoped>
.color {
  color: black;
}
</style>
