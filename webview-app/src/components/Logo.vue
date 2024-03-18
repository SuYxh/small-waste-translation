<template>
  <div class="logo-section" @click="handleLogoClick">
    <img src="https://qn.huat.xyz/mac/202403142136723.png" alt="Logo" class="logo-image">
    <span>小废物插件设置</span>
    <Conceal ref="concealRef"></Conceal>
  </div>
</template>

<script>
import { ref } from 'vue';
import Modal from './Modal/Modal.vue';
import Conceal from './Conceal.vue';
import { useClickTrigger } from '../hook';

export default {
  components: { Modal, Conceal },
  setup() {
    const concealRef = ref(null);

    const { startCounting } = useClickTrigger(6, 2000, () => {
      concealRef.value.showModal = true;
    });

    const handleLogoClick = () => {
      startCounting();
    };

    return { handleLogoClick, concealRef };
  }
};
</script>

<style scoped>
.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 24px;
  color: #1890ff;
}

.logo-image {
  width: 40px;
  height: 40px;
}

.logo-image:hover {
  transform: translate(-50%, -50%) rotate(666turn);
  transition: transform 59s 1s cubic-bezier(0.3, 0, 0.8, 1);
}
</style>
