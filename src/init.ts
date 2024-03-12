import * as vscode from 'vscode';
import { LOCAL_STORAGE_SERVICE } from '@/const';
import { DIContainer, LocalStorageService } from '@/utils';
import { handleOpenaiAccessToken } from '@/ai';

export async function init(context: vscode.ExtensionContext) {
  // 注册 LOCAL_STORAGE_SERVICE
  const localStorageService = new LocalStorageService(context.globalState);
  DIContainer.instance.register(LOCAL_STORAGE_SERVICE, localStorageService);

  // 处理openai的token 用于调用接口
  handleOpenaiAccessToken()
}