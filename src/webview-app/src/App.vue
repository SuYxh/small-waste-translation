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
        </Tabs>
      </div>
    </main>
  </div>


</template>

<script>
import Tabs from './components/Tabs.vue';
import LogoComponent from './components/Logo.vue';
import UserModule from './components/UserProfile.vue';
import ApiModule from './components/ApiModule.vue';
import LocalStorageModule from './components/Local.vue';

export default {
  name: 'App',
  components: {
    Tabs,
    LogoComponent,
    UserModule,
    ApiModule,
    LocalStorageModule,
  },
  data() {
    return {
      tabs: [
        { title: '简介', content: 'intro' },
        { title: '用户', content: 'user' },
        { title: 'API', content: 'api' },
        { title: '本地存储', content: 'localstorage' },
      ],
    };
  },
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
