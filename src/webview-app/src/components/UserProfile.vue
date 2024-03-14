<template>
  <div class="user-module">
    <div v-if="!isLoggedIn">
      <input v-model="phoneNumber" placeholder="手机号" class="input-style" />
      <input type="password" v-model="password" placeholder="密码" class="input-style" />
      <button @click="login" class="login-button">登录</button>
      <p>介绍文案</p>
    </div>
    <div v-else class="welcome-message">
      <p>欢迎回来，{{ userPhoneNumber }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'UserModule',
  setup() {
    const isLoggedIn = ref(false);
    const phoneNumber = ref('');
    const password = ref('');
    const userPhoneNumber = ref('');

    const login = () => {
      // 登录逻辑
      isLoggedIn.value = true;
      userPhoneNumber.value = phoneNumber.value;
    };

    return {
      isLoggedIn,
      phoneNumber,
      password,
      login,
      userPhoneNumber,
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
  box-sizing: border-box; /* 确保输入框的宽度不会因为padding而改变 */
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
</style>
