export class ExtensionCommunicator {
  constructor() {
    this.vscode = acquireVsCodeApi();
    this.callbacks = {};
    this.messageId = 0;

    window.addEventListener('message', event => this.handleMessage(event));
  }

  sendMessage(message, callback) {
    const id = ++this.messageId;
    this.callbacks[id] = callback;
    this.vscode.postMessage({ ...message, id });
  }

  handleMessage(event) {
    const message = event.data;
    // 检查消息是否为响应且是否有相应的回调函数
    if (message.id && this.callbacks[message.id]) {
      this.callbacks[message.id](message);
      delete this.callbacks[message.id]; // 移除已调用的回调函数
    }
  }
}
