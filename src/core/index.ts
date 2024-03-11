import * as vscode from 'vscode';
import { getSelectedText, replaceSelectedText, toCamelCase, withProgress } from '../utils/index';
import { DeepLService } from '../translation/deepl';

/**
 * 显示翻译结果并让用户选择
 * @param translations 翻译结果数组
 * @returns 用户选择的翻译结果
 */
async function showTranslationChoices(translations: string[]): Promise<string | undefined> {
  const selected = await vscode.window.showQuickPick(translations, {
    placeHolder: 'Choose your preferred translation',
  });
  return selected;
}


async function translateTextByDeepl(flag: string) {
  // 获取当前选中的文本
  const text = getSelectedText();
  if (!text) {
    vscode.window.showInformationMessage('No text selected');
    return;
  }

  // 实例化DeepLService
  const deepLService = new DeepLService(); // 确保这里正确传入了API Key或其他必要的初始化参数

  try {
    let translations = await withProgress<string[]>(
      'Translating...',
      (progress, token) => {

        if (flag === 'EN') {
          return deepLService.translateToEnglish(text)
        }

        if (flag === 'ZH') {
          return deepLService.translateToChinese(text)
        }

        return Promise.resolve([]);
      } // 确保translateToEnglish方法接受一个取消令牌
    )
    if (!translations) {
      // 当用户取消操作时，withProgress可能返回undefined
      return;
    }
    
    if (flag === 'EN') {
      // 处理翻译结果
      translations = translations.map(t => toCamelCase(t));
    }
    

    // 显示翻译结果并让用户选择
    const selectedTranslation = await showTranslationChoices(translations);
    if (!selectedTranslation) return;

    // 替换选中的文本
    await replaceSelectedText(selectedTranslation);
  } catch (error) {
    // 由于withProgress内部已处理取消逻辑，这里主要处理其他错误
    vscode.window.showErrorMessage('Translation failed: ' + error);
  }
}

export async function translateToChinese() {
  translateTextByDeepl('ZH');
}

export async function translateToEnglish() {
  translateTextByDeepl('EN');
}
