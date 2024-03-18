// message.js
import { createApp, h } from 'vue';
import MessageComponent from './Message.vue';

function showMessage(props) {
  const mountNode = document.createElement('div');
  document.body.appendChild(mountNode);

  const app = createApp({
    render() {
      return h(MessageComponent, {
        ...props,
        onClose: () => {
          app.unmount(mountNode);
          document.body.removeChild(mountNode);
        },
      });
    },
  });

  app.mount(mountNode);
}

export const message = {
  info(msg, duration = 2000) {
    showMessage({ message: msg, type: 'info', duration });
  },
  success(msg, duration = 2000) {
    showMessage({ message: msg, type: 'success', duration });
  },
  warning(msg, duration = 2000) {
    showMessage({ message: msg, type: 'warning', duration });
  },
  error(msg, duration = 2000) {
    showMessage({ message: msg, type: 'error', duration });
  },
};
