<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { ExtensionCommunicator } from './ExtensionCommunicator';
// 在你的 Webview 页面脚本中
const communicator = new ExtensionCommunicator();


const handleLogin = () => {
  console.log('handleLogin')
  communicator.sendMessage({ command: 'login', username: 'user', password: 'pass' });
}

// 发送登录请求

// 重写 handleMessage 方法来处理特定的响应
communicator.handleMessage = function(event) {
  console.log('handleMessage-->event', event)
  const message = event.data;
  switch (message.command) {
    case 'loginResponse':
      if (message.success) {
        console.log('登录成功！');
      } else {
        console.log('登录失败。');
      }
      break;
    // 处理其他消息类型
  }
};

</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />

  <button @click="handleLogin">handleLogin</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
