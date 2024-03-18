<template>
  <div>
    <Modal :visible="showModal" @update:visible="showModal = $event">
      <form @submit.prevent="submitForm" class="form">
        <div class="checkbox-group">
          <div v-for="(label, key) in options" :key="key" class="checkbox-wrapper">
            <!-- <input type="checkbox" :checked="settings[key]" @change="settings[key] = $event.target.checked" :id="key" class="checkbox-input"> -->
            <input type="checkbox" :checked="settings[key]" @change="handleChange(key, $event)" :id="key" class="checkbox-input">
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

    const handleChange = (key, e) => {
      // console.log('key', key, e.target.checked)
      store.state.debugger[key] = e.target.checked;
    }

    return {
      showModal,
      settings,
      options,
      handleChange
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
  color: #111;
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
