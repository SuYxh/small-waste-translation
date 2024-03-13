import { BaiduService } from './baidu';
import { TencentService } from './tencent';
import { DeepLService } from './deepl';
import {
  delPlatformFlag,
  gelAllPlatform,
  getOperationIdentifier,
  getSelectedText,
  insertTextBelowSelectionByComment,
  replaceSelectedText,
  showErrorMessage,
  showInformationMessage,
  showTranslationChoices,
  withProgress
} from '@/utils';
import type { ITranslationService, ITranslateTextResult } from '@/type';


// 平台列表
export const translationServices: ITranslationService[] = [
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
export async function translateText(targetLang: string, sourceLang: string) {
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