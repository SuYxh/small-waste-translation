export class ExtensionCommunicator {
  constructor() {
    // 将 VSCode API 实例保存为类的属性
    this.vscode = acquireVsCodeApi();
    window.addEventListener('message', event => this.handleMessage(event));
  }

  sendMessage(message) {
    // 使用保存的 VSCode API 实例来发送消息
    this.vscode.postMessage(message);
  }

  handleMessage(event) {
    const message = event.data; // 处理消息
    console.log(message);
  }
}
