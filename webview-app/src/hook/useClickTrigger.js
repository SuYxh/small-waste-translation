import { ref } from 'vue';

export function useClickTrigger(threshold = 6, timeLimit = 2000, callback) {
  const clickCount = ref(0);
  let clickTimer = null;

  const startCounting = () => {
    clickCount.value += 1;

    if (clickCount.value === 1) {
      clickTimer = setTimeout(() => {
        clickCount.value = 0; // 重置点击计数
      }, timeLimit);
    }

    if (clickCount.value >= threshold) {
      clearTimeout(clickTimer);
      clickCount.value = 0; // 成功触发后重置
      callback(); // 调用回调函数
    }
  };

  const resetCounting = () => {
    clearTimeout(clickTimer);
    clickCount.value = 0;
  };

  return { startCounting, resetCounting };
}
