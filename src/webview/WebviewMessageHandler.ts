import * as vscode from 'vscode';
import { WebviewCommunicator } from './WebviewCommunicator';
import { DIContainer, LocalStorageService, UsageLimitService } from '@/service';
import { LOCAL_STORAGE_SERVICE, USERNAME, PASSWORD, OPENAI_ACCESS_TOKEN, USAGE_LIMIT_SERVICE, WEBVIEW_MANAGER } from '@/const';
import { showErrorMessage, showInformationMessage } from '@/utils';
import { openaiLogin } from '@/ai/openai';
import { WebviewManager } from './index';
import { BaiduService, TencentService, DeepLService } from '@/translation';
import type { ITranslationService } from '@/type';

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

      case 'getUserInfo':
        await this.getUserInfo(message);
        break;

      case 'getRemainingUsageText':
        await this.getRemainingUsageText(message);
        break;

      case 'refresh':
        await this.refresh(message);
        break;

      case 'verifyApiKey':
        await this.verifyApiKey(message);
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

  private async refresh(message: any) {
    console.log('refresh request:', message.params);
    const webviewManager = DIContainer.instance.get<WebviewManager>(WEBVIEW_MANAGER);
    webviewManager.refresh()
    showErrorMessage('刷新成功');
  }

  private async getUserInfo(message: any) {
    console.log('getUserInfo request:', message);
    const username = this.localStorageService.get(USERNAME)
    const pwd = this.localStorageService.get(PASSWORD)
    const accessToken = this.localStorageService.get(OPENAI_ACCESS_TOKEN)

    // 发送响应回 Webview
    const result = { code: 0, data: { username, pwd, accessToken } };
    this.communicator.sendMessage({ id: message.id, ...result });
  }

  private async getRemainingUsageText(message: any) {
    console.log('getRemainingUsageText request:', message);
    const usageLimitService = DIContainer.instance.get<UsageLimitService>(USAGE_LIMIT_SERVICE);
    const text = usageLimitService.getRemainingUsageText()
    // 发送响应回 Webview
    const result = { code: 0, data: text };
    this.communicator.sendMessage({ id: message.id, ...result });
  }


  private async handleLogin(message: any) {
    console.log('Login request:', message.params);

    try {
      const username = message.params?.mobile ?? message.params?.username

      const result = await openaiLogin(username, message.params?.password);
      console.log('handleLogin--result', result)

      if (result.data) {
        // 成功
        const data = { code: 0, data: { token: result.data } };

        // 发送响应回 Webview
        this.communicator.sendMessage({ id: message.id, ...data });
        showInformationMessage('登录成功')
      } else {
        // 失败
        showErrorMessage(result.message)
        const data = { code: -1, data: { token: result.data } };
        this.communicator.sendMessage({ id: message.id, ...data });
      }
    } catch (error: any) {
      // 失败
      showErrorMessage(error.message)
      const data = { code: -1, data: { token: null } };
      this.communicator.sendMessage({ id: message.id, ...data });
    }
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
    // 发送响应回 Webview
    const result = { code: 0, data: '设置成功' }; // 假设的处理结果
    this.communicator.sendMessage({ id: message.id, ...result });
  }

  private async delStorage(message: any) {
    console.log('delStorage request:', message.params);
    await this.localStorageService.delete(message.params?.key)
    showInformationMessage('删除成功')
    const result = { code: 0, data: '删除成功' }; // 假设的处理结果
    this.communicator.sendMessage({ id: message.id, ...result });
  }

  private async delAllStorage(message: any) {
    console.log('delAllStorage request:', message.params);
    await this.localStorageService.clearAllData()
    showInformationMessage('所有数据删除成功')
    const result = { code: 0, data: '所有数据删除成功' }; // 假设的处理结果
    this.communicator.sendMessage({ id: message.id, ...result })
  }

  private async verifyApiKey(message: any) {
    console.log('delAllStorage request:', message.params);
    const { key, secret, platform } = message.params
    let instance: ITranslationService = {} as ITranslationService
    switch (platform) {
      case 'baidu':
        instance = new BaiduService()
        break;
      case 'tencent':
        instance = new TencentService()
        break;
      case 'deepl':
        instance = new DeepLService()
        break;
      default:
        instance = {} as ITranslationService
        break;
    }

    const flag = await instance.verifyApiKey(key, secret)
    if (flag) {
      showInformationMessage('验证成功')
    } else {
      showErrorMessage('验证失败')
    }
    const result = { code: 0, data: flag }; // 假设的处理结果
    this.communicator.sendMessage({ id: message.id, ...result })
  }
}
