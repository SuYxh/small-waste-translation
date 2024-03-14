import * as vscode from 'vscode';
import { WebviewCommunicator } from './WebviewCommunicator';

export class WebviewMessageHandler {

  private panel: vscode.WebviewPanel;
  private communicator: WebviewCommunicator;
  private context: vscode.ExtensionContext; // 添加这行

  constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) { // 调整这行
    this.panel = panel;
    this.context = context; // 添加这行
    this.communicator = new WebviewCommunicator(panel);
    this.setupMessageListener();
  }

  private setupMessageListener() {
    const disposable = this.panel.webview.onDidReceiveMessage(
      async (message: any) => {
        console.log('setupMessageListener-->', message)

        switch (message.command) {
          case 'login':
            await this.handleLogin(message);
            break;
          case 'logout':
            // await this.handleLogout(message);
            break;
          // 添加其他case处理不同的消息
        }
      },
      undefined,
      this.context.subscriptions // 修改这行
    );
    // 确保监听器被正确添加到 context.subscriptions 中
    this.context.subscriptions.push(disposable);
  }

  private async handleLogin(message: { command: string;[key: string]: any }) {
    console.log('Login request:', message);
    // 处理登录逻辑...
    this.communicator.sendMessage({ command: 'loginResponse', success: true });
  }

  // 可以添加更多的处理函数，如 handleLogout、handleFetchCache 等
}
