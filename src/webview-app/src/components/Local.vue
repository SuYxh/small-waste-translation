<template>
  <div class="local-storage-module">
    <ul>
      <li v-for="(item, index) in items" :key="index">
        <div v-if="editIndex !== index" class="item-display">
          <span>{{ item.name }}: {{ item.value }}</span>
          <div>
            <button @click="startEdit(index)" class="action-button edit-button">修改</button>
            <button @click="deleteItem(index)" class="action-button delete-button">删除</button>
          </div>
        </div>
        <div v-else class="item-edit">
          <span>{{ item.name }}: </span>
          <input v-model="editValue" @keyup.enter="confirmEdit" class="edit-input">
          <button @click="confirmEdit" class="action-button confirm-button">确认</button>
          <button @click="cancelEdit" class="action-button cancel-button">取消</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LocalStorageModule',
  setup() {
    const items = ref([
      { name: 'API 1', value: '值 1' },
      { name: 'API 2', value: '值 2' },
      { name: 'API 3', value: '值 3' },
      { name: 'API 4', value: '值 4' },
      { name: 'API 5', value: '值 5' },
      { name: 'API 6', value: '值 6' },
      { name: 'API 7', value: '值 7' },
      { name: 'API 8', value: '值 8' },
    ]);
    const editIndex = ref(-1);
    const editValue = ref('');

    const startEdit = (index) => {
      editIndex.value = index;
      editValue.value = items.value[index].value;
    };

    const confirmEdit = () => {
      if (editIndex.value !== -1) {
        items.value[editIndex.value].value = editValue.value;
        cancelEdit(); // Reset edit state
      }
    };

    const cancelEdit = () => {
      editIndex.value = -1;
      editValue.value = '';
    };

    const deleteItem = (index) => {
      items.value.splice(index, 1);
    };

    return {
      items,
      editIndex,
      editValue,
      startEdit,
      confirmEdit,
      cancelEdit,
      deleteItem,
    };
  },
}
</script>

<style scoped>
.local-storage-module ul {
  max-height: 60vh;
  padding: 0;
  list-style-type: none;
  overflow: auto;
}

.local-storage-module li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  /* background-color: #f5f5f5; */
  background-color: #fff;

  border-radius: 4px;
}

.item-display span, .item-edit span {
  flex-grow: 1;
}

.action-button {
  margin-left: 4px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button, .delete-button {
  background-color: #1890ff;
  color: white;
}

.confirm-button {
  background-color: #52c41a;
  color: white;
}

.cancel-button {
  background-color: #ff4d4f;
  color: white;
}

.edit-input {
  margin: 0 8px;
  padding: 5px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.edit-button:hover, .delete-button:hover, .confirm-button:hover, .cancel-button:hover {
  opacity: 0.8;
}
</style>
