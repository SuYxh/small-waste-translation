import {  showInformationMessage, useFeatureTranslate } from '@/utils';
import { UsageLimitService, DIContainer } from '@/service';
import { TRANSLATE, GENERATE_FUNCTION_NAME, USAGE_LIMIT_SERVICE } from '@/const';
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
  const usageLimitService = DIContainer.instance.get<UsageLimitService>(USAGE_LIMIT_SERVICE);
  // TODO: vip 用户才可以使用这个重置
  usageLimitService.initializeDailyLimits()
  showInformationMessage('重置成功')
}


export const getRestCallTime = () => {
  const usageLimitService = DIContainer.instance.get<UsageLimitService>(USAGE_LIMIT_SERVICE);
  const text = usageLimitService.getRemainingUsageText()
  showInformationMessage(text)
}