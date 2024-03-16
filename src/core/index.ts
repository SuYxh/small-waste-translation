import {  useFeatureTranslate } from '@/utils';
import {  DIContainer, UserService, LocalStorageService } from '@/service';
import { TRANSLATE, GENERATE_FUNCTION_NAME, LOCAL_STORAGE_SERVICE, WEBVIEW_MANAGER } from '@/const';
import { translateText } from '@/translation';
import { askToAI } from '@/ai';
import { WebviewManager } from '@/webview';
import * as vscode from 'vscode';


// 将选中文本翻译成中文
export const translateToChinese = () => {
  const fn = translateText.bind(this, 'ZH', 'EN')
  useFeatureTranslate({
    successCb: fn,
    apiName: TRANSLATE
  })
}

// 将选中文本翻译成英文
export const translateToEnglish = () => {
  const fn = translateText.bind(this, 'EN', 'ZH')
  useFeatureTranslate({
    successCb: fn,
    apiName: TRANSLATE
  })
}

// 函数名称生成
export const generateFunctionName = async () => {
  useFeatureTranslate({
    successCb: askToAI,
    apiName: GENERATE_FUNCTION_NAME
  })
};

export const login = () => {
  const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
  const userService = new UserService(localStorageService) 
  userService.login()
}

export const loginout = () => {
  const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
  const userService = new UserService(localStorageService) 
  userService.logout()
}


export const setting = (context: vscode.ExtensionContext) => {
  console.log('setting')
  const webviewManager = new WebviewManager(context)
  DIContainer.instance.register(WEBVIEW_MANAGER, webviewManager);
  webviewManager.openWebview()
}