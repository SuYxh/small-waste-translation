<template>
  <div class="api-module">
    <div class="api-section">
      <input v-model="tencentAppId" placeholder="腾讯AppId" class="input-style" />
      <input v-model="tencentAppKey" placeholder="腾讯AppKey" class="input-style" />
      <button @click="validateTencent" class="validate-button">验证</button>
    </div>
    <div class="api-section">
      <input v-model="baiduAppId" placeholder="百度AppId" class="input-style" />
      <input v-model="baiduAppKey" placeholder="百度AppKey" class="input-style" />
      <button @click="validateBaidu" class="validate-button">验证</button>
    </div>
    <div class="api-section">
      <input v-model="deeplApiKey" placeholder="DeepL ApiKey" class="input-style" />
      <button @click="validateDeepl" class="validate-button">验证</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ApiModule',
  setup() {
    const tencentAppId = ref('');
    const tencentAppKey = ref('');
    const baiduAppId = ref('');
    const baiduAppKey = ref('');
    const deeplApiKey = ref('');

    const validateTencent = () => {
      // 验证逻辑
    };
    const validateBaidu = () => {
      // 验证逻辑
    };
    const validateDeepl = () => {
      // 验证逻辑
    };

    return {
      tencentAppId,
      tencentAppKey,
      baiduAppId,
      baiduAppKey,
      deeplApiKey,
      validateTencent,
      validateBaidu,
      validateDeepl,
    };
  },
}
</script>

<style scoped>
.api-module .input-style {
  width: calc(100% - 90px); /* 保留按钮宽度 */
  margin-right: 10px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-sizing: border-box;
}

.api-module .validate-button {
  width: 80px;
  padding: 8px 0;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.api-module .validate-button:hover {
  background-color: #40a9ff;
}

.api-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
</style>
