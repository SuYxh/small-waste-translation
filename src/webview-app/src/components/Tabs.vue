<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-title"
        :class="{ active: currentTab === index }"
        @click="currentTab = index"
      >
        {{ tab.title }}
      </div>
    </div>
    <div class="tab-content">
      <slot :name="tabs[currentTab].content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentTab: 0, // 默认显示第一个tab
    };
  },
};
</script>

<style scoped>
.tabs-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.tabs-header {
  display: flex;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8e8e8;
}

.tab-title {
  margin-right: 20px;
  padding: 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-title.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.tab-content {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 20px;
}
</style>
