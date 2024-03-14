<template>
  <div class="logo-section">
    <img src="https://qn.huat.xyz/mac/202403142136723.png" alt="Logo" class="logo-image">
    <span>😄小废物插件设置</span>
  </div>
</template>

<script>
export default {
  name: 'LogoComponent',
}
</script>

<style scoped>
.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 24px;
  color: #1890ff; /* Ant Design 的主题蓝色 */
}

.logo-image {
  width: 40px; /* 根据实际情况调整 */
  height: 40px; /* 根据实际情况调整 */
}
</style>
