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
  /* Ant Design 的主题蓝色 */
}

.logo-image {
  width: 40px;
  /* 根据实际情况调整 */
  height: 40px;
  /* 根据实际情况调整 */
}
</style>
