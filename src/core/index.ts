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
    const translationFunction = flag === 'EN' ? deepLService.translateToEnglish.bind(deepLService) : deepLService.translateToChinese.bind(deepLService);
    let translations = await withProgress<string[]>(
      'Translating...',
      (progress, token) => translationFunction(text) // 假设translateToEnglish和translateToChinese都返回Promise<string[]>
    );

    if (!translations) {
      return;
    }

    translations = flag === 'EN' ? translations.map(toCamelCase) : translations;

    const selectedTranslation = await showTranslationChoices(translations);
    if (!selectedTranslation) return;

    await replaceSelectedText(selectedTranslation);
  } catch (error) {
    vscode.window.showErrorMessage(`Translation failed: ${error}`);
  }
}

export async function translateToChinese() {
  translateTextByDeepl('ZH');
}

export async function translateToEnglish() {
  translateTextByDeepl('EN');
}
