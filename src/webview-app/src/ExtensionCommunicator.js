
export class ExtensionCommunicator {
  static instance = null;

  constructor() {
    if (ExtensionCommunicator.instance) {
      throw new Error("Error: Instantiation failed: Use ExtensionCommunicator.getInstance() instead of new.");
    }
    this.vscode = acquireVsCodeApi();
    this.callbacks = {};
    this.messageId = 0;

    window.addEventListener('message', event => this.handleMessage(event));
  }

  static getInstance() {
    if (ExtensionCommunicator.instance === null) {
      ExtensionCommunicator.instance = new ExtensionCommunicator();
    }
    return ExtensionCommunicator.instance;
  }

  // 其他方法保持不变...

  handleMessage(event) {
    const message = event.data;
    if (message.id && this.callbacks[message.id]) {
      if (typeof this.callbacks[message.id] === 'function') {
        Promise.resolve(this.callbacks[message.id](message)).catch(error => {
          console.error(error)
        }).finally(() => {
          delete this.callbacks[message.id];
        })
      }
    }
  }

  sendMessage(message, callback) {
    const id = ++this.messageId;
    this.callbacks[id] = callback;
    this.vscode.postMessage({ ...message, id });
  }
}

