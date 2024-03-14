import * as vscode from 'vscode';
import { WebviewCommunicator } from './WebviewCommunicator';
import { DIContainer, LocalStorageService } from '@/service';
import { LOCAL_STORAGE_SERVICE } from '@/const';
import { showErrorMessage, showInformationMessage } from '@/utils';

export class WebviewMessageHandler {

  private panel: vscode.WebviewPanel;
  private communicator: WebviewCommunicator;
  private context: vscode.ExtensionContext; // 添加这行

  private localStorageService: LocalStorageService;

  constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) { // 调整这行
    this.panel = panel;
    this.context = context; // 添加这行
    this.communicator = new WebviewCommunicator(panel);
    this.localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
    this.setupMessageListener();
  }

  private async handler(message: any) {
    switch (message.command) {
      case 'login':
        await this.handleLogin(message);
        break;
      case 'logout':
        // await this.handleLogout(message);
        break;
      case 'getAllStorage':
        await this.getAllStorage(message);
        break;

      case 'delAllStorage':
        await this.delAllStorage(message);
        break;

      case 'delStorage':
        await this.delStorage(message);
        break;

      case 'getStorage':
        await this.getStorage(message);
        break;

      case 'setStorage':
        await this.setStorage(message);
        break;

      default:
        await this.handleDefault(message);
        break;
    }
  }

  private setupMessageListener() {
    const disposable = this.panel.webview.onDidReceiveMessage(
      async (message: any) => {
        console.log('setupMessageListener-->', message)

        this.handler(message);
      },
      undefined,
      this.context.subscriptions // 修改这行
    );
    // 确保监听器被正确添加到 context.subscriptions 中
    this.context.subscriptions.push(disposable);
  }

  private async handleDefault(message: any) {
    console.log('handleDefault request:', message.params);
    showErrorMessage('暂不支持该操作');
  }

  private async handleLogin(message: any) {
    console.log('Login request:', message.params);

    // 假设处理登录逻辑...
    const result = { code: 0, data: { token: "some-token" } }; // 假设的处理结果

    // 发送响应回 Webview
    this.communicator.sendMessage({ id: message.id, ...result });
  }


  private async getAllStorage(message: any) {
    console.log('getAllStorage request:', message.params);
    const allData = await this.localStorageService.getAllDataAsString();
    console.log('getAllStorage-->', allData)
    // 假设处理登录逻辑...
    const result = { code: 0, data: allData }; // 假设的处理结果

    // 发送响应回 Webview
    this.communicator.sendMessage({ id: message.id, ...result });
  }

  private async getStorage(message: any) {
    console.log('getStorage request:', message.params);
    const data = await this.localStorageService.get(message.params?.key)

    // 发送响应回 Webview
    const result = { code: 0, data }; // 假设的处理结果
    this.communicator.sendMessage({ id: message.id, ...result });
  }

  private async setStorage(message: any) {
    console.log('setStorage request:', message.params);
    await this.localStorageService.set(message.params?.key, message.params.value)
    showInformationMessage('设置成功')
  }

  private async delStorage(message: any) {
    console.log('delStorage request:', message.params);
    await this.localStorageService.delete(message.params?.key)
    showInformationMessage('删除成功')
  }

  private async delAllStorage(message: any) {
    console.log('delAllStorage request:', message.params);
    await this.localStorageService.clearAllData()
    showInformationMessage('所有数据删除成功')
  }
}
