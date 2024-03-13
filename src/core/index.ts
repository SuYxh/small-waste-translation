import * as vscode from 'vscode';
import { getSelectedText, replaceSelectedText, withProgress, showTranslationChoices, showErrorMessage, gelAllPlatform, delPlatformFlag, insertTextBelowSelectionByComment, showInformationMessage, getOperationIdentifier, extractPenultimateJson, extractDataFromString, useFeatureTranslate, UsageLimitService, DIContainer } from '@/utils';
import { DeepLService, BaiduService, TencentService } from '@/translation';
import { chatProgress } from '@/ai';
import { TRANSLATE, GENERATE_FUNCTION_NAME, USAGE_LIMIT_SERVICE } from '@/const';
import type { ITranslationService, ITranslateTextResult } from '@/translation';

// 平台列表
const translationServices: ITranslationService[] = [
  new DeepLService(),
  new TencentService(),
  new BaiduService(),
];

/**
 * 翻译文本
 *
 * @param targetLang 目标语言
 * @param sourceLang 源语言
 * @returns 翻译后的文本
 */
async function translateText(targetLang: string, sourceLang: string) {
  // 获取选中的文本
  const text = getSelectedText();
  if (!text) {
    showInformationMessage('No text selected')
    return;
  }

  try {
    // 当前选中的翻译服务
    let currentSelect: ITranslateTextResult = {} as ITranslateTextResult

    // 获取翻译结果, 并且增加loading提示
    const allTranslations = await withProgress<ITranslateTextResult[]>(
      'Translating...',
      // @ts-ignore
      async (progress, token) => {

        const translationsPromises = translationServices.map(service =>
          service.translateText(text, targetLang, sourceLang).catch(error => {
            console.error(error);
            return [];
          })
        );

        const translationsResults = await Promise.all(translationsPromises);

        const allTranslations = translationsResults.flat().filter(translation => translation.translation.length > 0);

        if (allTranslations.length === 0) {
          showErrorMessage('All translation services failed.')
          return []
        }

        return allTranslations
      }
    )

    // 提取翻译结果
    const selectAllTranslations = allTranslations.map(item => item.translation);

    // 获取选择的翻译结果
    let selectedTranslation = await showTranslationChoices(selectAllTranslations);
    if (!selectedTranslation) return;

    // 当前选中的翻译服务
    currentSelect = allTranslations.find(item => item.translation === selectedTranslation) as ITranslateTextResult
    // {translation: 'Calling Tencent Maps --by-deepl', originText: '调用腾讯地图', sourceLang: 'ZH', targetLang: 'EN', platform: 'deepl'}
    // console.log('currentSelect', currentSelect)

    // 删除平台标识
    selectedTranslation = delPlatformFlag(selectedTranslation, gelAllPlatform(translationServices))

    // 获取操作标识：是插入到选中文本下方还是替换选中文本
    const flag = getOperationIdentifier(currentSelect, selectedTranslation)

    if (flag === 'insert') {
      // 插入到选中文本下方
      await insertTextBelowSelectionByComment(selectedTranslation)
    } else {
      // 替换选中文本
      await replaceSelectedText(selectedTranslation);
    }
  } catch (error) {
    showErrorMessage(`Translation failed: ${error}`);
  }
}

// 将选中文本翻译成中文
export const translateToChinese = () => {
  const fn = translateText.bind(this, 'ZH', 'EN')
  useFeatureTranslate({
    successCb: fn,
    apiName: TRANSLATE
  })
}


// 将选中文本翻译成英文
// export const translateToEnglish = () => translateText('EN', 'ZH');
export const translateToEnglish = () => {
  const fn = translateText.bind(this, 'EN', 'ZH')
  useFeatureTranslate({
    successCb: fn,
    apiName: TRANSLATE
  })
}

async function askToChatGPT() {
  // 获取选中的文本
  const text = getSelectedText();
  if (!text) {
    showInformationMessage('No text selected')
    return;
  }

  try {
    const arrayBuffer = await withProgress<any>(
      '思考中...',
      // @ts-ignore
      async (progress, token) => {
        const arrayBuffer = await chatProgress(text)
        return arrayBuffer
      }
    )

    // 将 ArrayBuffer 转换为 Buffer
    const buffer = Buffer.from(arrayBuffer);

    const result: any = extractPenultimateJson(buffer.toString())
    if (result.text) {
      const formatData: any = extractDataFromString(result.text)

      let selected = await showTranslationChoices(formatData.data ?? []);
      if (!selected) return;
      await replaceSelectedText(selected);
    }
  } catch (error) {
    console.log('generateFunctionName-error', error);
  }
}


// 函数名称生成
export const generateFunctionName = async () => {
  useFeatureTranslate({
    successCb: askToChatGPT,
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