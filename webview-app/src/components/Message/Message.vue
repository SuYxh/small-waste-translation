<template>
  <transition name="message-fade">
    <div v-if="visible" class="message" :class="`message-${type}`">{{ message }}</div>
  </transition>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'info', // 'success', 'info', 'warning', 'error'
    },
    message: String,
    duration: {
      type: Number,
      default: 2000,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
      }, this.duration);
    },
  },
  mounted() {
    this.show();
  },
};
</script>

<style>
.message {
  padding: 10px 20px;
  color: #fff;
  border-radius: 4px;
  margin: 10px;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}
.message-fade-enter-active, .message-fade-leave-active {
  transition: opacity 0.5s;
}
.message-fade-enter, .message-fade-leave-to /* .message-fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
.message-info {
  background-color: #1890ff;
}
.message-success {
  background-color: #52c41a;
}
.message-warning {
  background-color: #faad14;
}
.message-error {
  background-color: #ff483c;
}
</style>
