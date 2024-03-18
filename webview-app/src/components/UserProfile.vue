<template>
  <div class="user-module">
    <div v-if="!isLoggedIn">
      <input v-model="phoneNumber" placeholder="手机号" class="input-style" />
      <input type="password" v-model="password" placeholder="密码" class="input-style" />
      <button @click="login" class="login-button">登录</button>
      <p v-if="remainingUsageText">{{ remainingUsageText }}</p>
      <p v-else>登录后可以无限使用</p>
      <p>注册地址: <a href="https://ask.vuejs.news/" target="_blank" rel="noopener noreferrer">https://ask.vuejs.news/</a></p>
    </div>
    <div v-else class="welcome-message">
      <p>欢迎回来，{{ userPhoneNumber }}</p>
      <p v-if="remainingUsageText">{{ remainingUsageText }}</p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { message } from './Message/message';
import { sendMessage } from '../utils/ExtensionCommunicator';
import { store } from '../store/index';

export default {
  name: 'UserModule',
  setup() {
    const isLoggedIn = ref(false);
    const phoneNumber = ref('');
    const password = ref('');
    const userPhoneNumber = ref('');
    const remainingUsageText = ref('');

    watch(() => store.state.userInfo, (newVal) => {
      console.log('watch-userInfo', newVal, newVal.username)

      const username = newVal.username ?? newVal.mobile
      const pwd = newVal.password ?? newVal.pwd
      const accessToken = newVal.accessToken ?? newVal.openaiAccessToken

      if (username && pwd && accessToken && username !== '18372635819') {
        isLoggedIn.value = true;
        userPhoneNumber.value = username;
        password.value = pwd
      }
    }, { immediate: true, deep: true })

    watch(() => store.state.remainingUsageText, (newVal) => {
      console.log('watch-remainingUsageText', newVal)
      if (newVal) {
        remainingUsageText.value = newVal;
      }
    }, { immediate: true })
    
    const login = () => {
      if (!password.value || !phoneNumber.value) {
        message.error('请输入手机号和密码')
        return
      }

      sendMessage('login', { username: phoneNumber.value, password: password.value } , (result) => {
        if (result.code == 0) {
          console.log('login-result', result);
          store.getUserInfo();
          store.getRemainingUsageText();
          store.getAllLocalData();
          isLoggedIn.value = true;
        } else {
          console.log('login-失败', result);
          message.error(result.message ?? '登录失败');
        }
      })
    }

    return {
      login,
      isLoggedIn,
      phoneNumber,
      password,
      userPhoneNumber,
      remainingUsageText
    };
  },
}
</script>

<style scoped>
.user-module .input-style {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-sizing: border-box;
  /* 确保输入框的宽度不会因为padding而改变 */
}

.login-button {
  width: 100%;
  padding: 10px 0;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #40a9ff;
}

.welcome-message p {
  color: #1890ff;
  font-weight: 500;
}
</style>../hook/useCommunicator/ExtensionCommunicator
