<template>
  <div class="TestOperation">
    <button @click="setStorage" class="mr">setStorage</button>
    <button @click="getStorage" class="mr">getStorage</button>
    <button @click="delStorage" class="">delStorage</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { sendMessage } from '../utils/ExtensionCommunicator';
import { store } from '../store/index';

const key = 'test_storage_key';

export default {
  setup() {
    const storageVal = ref('');

    const setStorage = () => {
      sendMessage('setStorage', { key, value: '测试 storage' }, (result) => {
        if (+result.code === 0) {
          console.log('设置成功')
          store.getAllLocalData()
        }
      })
    }

    const getStorage = () => {
      sendMessage('getStorage', { key }, (result) => {
        if (+result.code === 0) {
          storageVal.value = result.data;
          store.getAllLocalData()
        }
      })
    }

    const delStorage = () => {
      sendMessage('delStorage', { key }, (result) => {
        if (+result.code === 0) {
          console.log('删除成功')
          store.getAllLocalData()
        }
      })
    }

    return { storageVal, setStorage, getStorage, delStorage };
  }
};
</script>

<style scoped>
.mr {
  margin-right: 16px;
}
</style>
