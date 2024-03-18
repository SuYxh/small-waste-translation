<template>
  <div class="api-module">
    <div class="api-section">
      <input v-model="tencentAppId" placeholder="腾讯AppId" class="input-style" />
      <input v-model="tencentAppKey" placeholder="腾讯AppKey" class="input-style" />
      <button @click="validateTencent" class="validate-button">{{ tencentAppId ? '已验证' : '验证' }}</button>
    </div>
    <div class="api-section">
      <input v-model="baiduAppId" placeholder="百度AppId" class="input-style" />
      <input v-model="baiduAppKey" placeholder="百度AppKey" class="input-style" />
      <button @click="validateBaidu" class="validate-button">{{ baiduAppId ? '已验证' : '验证' }}</button>
    </div>
    <div class="api-section">
      <input v-model="deeplApiKey" placeholder="DeepL ApiKey" class="input-style" />
      <button @click="validateDeepl" class="validate-button">{{ deeplApiKey ? '已验证' : '验证' }}</button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { sendMessage } from '../utils/ExtensionCommunicator';
import { message } from './Message/message';
import { store } from '../store/index';

export default {
  name: 'ApiModule',
  setup() {
    const tencentAppId = ref('');
    const tencentAppKey = ref('');
    const baiduAppId = ref('');
    const baiduAppKey = ref('');
    const deeplApiKey = ref('');

    // 创建映射表，将配置项名称映射到对应的ref对象
    const apiKeysRefMapping = {
      deeplKey: deeplApiKey,
      baiduAppId: baiduAppId,
      baiduAppKey: baiduAppKey,
      tencentSecertId: tencentAppId,
      tencentSecertKey: tencentAppKey,
    };

    watch(() => store.state.localData, (newValue) => {
      console.log('watch - localData- changed', newValue)
      // if (newValue.length > 0) {
      // deeplApiKey.value = newValue.find(item => item.name == 'deeplKey').value
      // baiduAppId.value = newValue.find(item => item.name == 'baiduAppId').value
      // baiduAppKey.value = newValue.find(item => item.name == 'baiduAppKey').value
      // tencentAppId.value = newValue.find(item => item.name == 'tencentSecertId').value
      // tencentAppKey.value = newValue.find(item => item.name == 'tencentSecertKey').value
      // }
      if (newValue.length > 0) {
        newValue.forEach(item => {
          const keyRef = apiKeysRefMapping[item.name];
          if (keyRef) {
            keyRef.value = item.value;
          }
        });
      }
    }, { immediate: true, deep: true })

    const validate = (params) => {
      sendMessage('verifyApiKey', params, (result) => {
        if (result.code == 0) {
          console.log('验证成功')
          store.getAllLocalData()
        } else {
          message.error('验证失败');
        }
      })
    }

    const validateTencent = () => {
      // 验证逻辑
      if (!tencentAppId.value || !tencentAppKey.value) {
        message.error('请输入AppId和AppKey')
        return
      }
      validate({
        key: tencentAppId.value,
        secret: tencentAppKey.value,
        platform: 'tencent'
      })
    };
    const validateBaidu = () => {
      // 验证逻辑
      if (!baiduAppId.value || !baiduAppKey.value) {
        message.error('请输入AppId和AppKey')
        return
      }
      validate({
        key: baiduAppId.value,
        secret: baiduAppKey.value,
        platform: 'baidu'
      })
    };
    const validateDeepl = () => {
      // 验证逻辑
      if (!deeplApiKey.value) {
        message.error('请输入apikey')
        return
      }
      validate({
        key: deeplApiKey.value,
        platform: 'deepl'
      })
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
  width: calc(100% - 90px);
  /* 保留按钮宽度 */
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
