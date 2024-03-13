import {  showInformationMessage, useFeatureTranslate } from '@/utils';
import { UsageLimitService, DIContainer, UserService, LocalStorageService } from '@/service';
import { TRANSLATE, GENERATE_FUNCTION_NAME, USAGE_LIMIT_SERVICE, LOCAL_STORAGE_SERVICE, IS_SYSTEM_USER } from '@/const';
import { translateText } from '@/translation';
import { askToAI } from '@/ai';


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


export const resetCallTime = () => {
  // vip 用户才可以使用这个重置
  // const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
  // const isSystemUser = localStorageService.get(IS_SYSTEM_USER)
  // if (isSystemUser) {
  //   showInformationMessage('您没有权限重置')
  //   return;
  // }

  const usageLimitService = DIContainer.instance.get<UsageLimitService>(USAGE_LIMIT_SERVICE);
  usageLimitService.initializeDailyLimits()
  showInformationMessage('重置成功')
}


export const getRestCallTime = () => {
  const usageLimitService = DIContainer.instance.get<UsageLimitService>(USAGE_LIMIT_SERVICE);
  const text = usageLimitService.getRemainingUsageText()
  showInformationMessage(text)
}


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