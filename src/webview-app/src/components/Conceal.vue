<template>
  <div>
    <button @click="showModal = true">Show Modal</button>
    <Modal :visible="showModal" @update:visible="showModal = $event">
      <form @submit.prevent="submitForm" class="form">
        <div class="checkbox-group">
          <div v-for="(label, key) in options" :key="key" class="checkbox-wrapper">
            <input type="checkbox" :checked="settings[key]" @change="settings[key] = $event.target.checked" :id="key" class="checkbox-input">
            <label :for="key" class="checkbox-label">{{ label }}</label>
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import { ref } from 'vue';
import Modal from './Modal/Modal.vue';
import { store } from '../store/index';

export default {
  components: {
    Modal,
  },
  setup() {
    const showModal = ref(false);
    const settings = ref(store.state.debugger);
    // 配置选项
    const options = {
      isDebug: '开启 debug',
    };

    return {
      showModal,
      settings,
      options
    };
  },
};
</script>

<style>
.checkbox-group {
  margin-bottom: 20px;
}
.checkbox-wrapper {
  margin-bottom: 10px;
}
.checkbox-input {
  margin-right: 10px;
}
.checkbox-label {
  cursor: pointer;
}
.submit-button {
  cursor: pointer;
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 5px;
}
.form {
  display: flex;
  flex-direction: column;
}
</style>
