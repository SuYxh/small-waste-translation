<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick">
      <div class="modal-content">
        <slot></slot>
        <div class="modal-footer">
          <button @click="handleCloseClick">关闭</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  props: {
    visible: Boolean,
  },
  emits: ['update:visible'],
  methods: {
    handleOverlayClick() {
      this.$emit('update:visible', false);
    },
    handleCloseClick() {
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.modal-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
