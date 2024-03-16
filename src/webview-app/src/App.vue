<template>

  <div class="app-container">
    <header>
      <LogoComponent />
    </header>
    <main>
      <div class="main-container">
        <Tabs :tabs="tabs">
          <template #intro>
            <div>这是一个使用Vue 3和Vite构建的应用，旨在演示如何通过Tab组件优雅地组织内容。</div>
          </template>
          <template #user>
            <UserModule />
          </template>
          <template #api>
            <ApiModule />
          </template>
          <template #localstorage>
            <LocalStorageModule />
          </template>
          <template #testOperation>
            <TestOperation />
          </template>
        </Tabs>
      </div>
    </main>
  </div>


</template>

<script>
import { ref, watch } from 'vue';
import Tabs from './components/Tabs.vue';
import LogoComponent from './components/Logo.vue';
import UserModule from './components/UserProfile.vue';
import ApiModule from './components/ApiModule.vue';
import LocalStorageModule from './components/Local.vue';
import TestOperation from './components/TestOperation.vue';
import { store } from './store/index';

export default {
  name: 'App',
  components: {
    Tabs,
    LogoComponent,
    UserModule,
    ApiModule,
    LocalStorageModule,
    TestOperation
  },
  setup() {
    const tabs = ref([
      { title: '简介', content: 'intro' },
      { title: '用户', content: 'user' },
      { title: 'API', content: 'api' },
    ]);

    store.getVscodeData()

    watch(() => store.state.debugger, (newVal, oldVal) => {
      if (newVal.isDebug) {
        tabs.value.push({ title: '本地存储', content: 'localstorage' });
        tabs.value.push({ title: '操作测试', content: 'testOperation' });
      } else {
        tabs.value.pop();
      }
    }, {
      immediate: true,
      deep: true,
    })

    return { tabs };
  }
};


</script>

<style>
.app-container {
  /* max-width: 800px; */
  /* margin: 0 auto; */
  padding: 20px;
}

header {
  margin-bottom: 20px;
}

main {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
