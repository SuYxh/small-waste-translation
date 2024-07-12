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

export * from './baidu';
export * from './tencent';
export * from './deepl';

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
    showInformationMessage('请先选中需要翻译的文案哦')
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
            console.error('翻译服务出错', error);
            return [];
          })
        );

        // 并发执行翻译服务
        const translationsResults = await Promise.all(translationsPromises);

        // 选择翻译有结果的数据
        const allTranslations = translationsResults.flat().filter(translation => translation.translation.length > 0);

        if (allTranslations.length === 0) {
          showErrorMessage('翻译服务不可用!')
          return []
        }

        return allTranslations
      }
    )

    // 转换翻译结果为 vscode.window.showQuickPick 需要的格式
    const selectAllTranslations = allTranslations.map(item => item.translation);

    // 获取选择的翻译结果
    let selectedTranslation = await showTranslationChoices(selectAllTranslations);
    if (!selectedTranslation) return;

    // TODO： 这里可以上报用户选择的平台，看看用户最喜欢那一个

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
    showErrorMessage(`翻译失败: ${error}`);
  }
}