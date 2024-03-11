import * as vscode from 'vscode';
import { getSelectedText, replaceSelectedText, toCamelCase, withProgress } from '../utils/index';
import { DeepLService } from '../translation/deepl';
// import { VolcanoService } from '../translation/volcanoService';
import { ITranslationService } from '../translation/ITranslationService';

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


const translationServices: ITranslationService[] = [
  new DeepLService(),
  // new VolcanoService(),
  // new VolcanoService(),
  // new TencentService(),
  // new BaiduService(),
];

async function translateText(targetLang: string, sourceLang: string) {
  const text = getSelectedText();
  if (!text) {
    vscode.window.showInformationMessage('No text selected');
    return;
  }

  await withProgress<string[][]>(
    'Translating...',
    // @ts-ignore
    async (progress, token) => {

      const translationsPromises = translationServices.map(service =>
        service.translateText(text, targetLang, sourceLang).catch(error => {
          // Log the error and return an empty array to ensure Promise.all settles all promises.
          console.error(error);
          return [];
        })
      );

      const translationsResults = await Promise.all(translationsPromises);

      // Flatten the array of arrays and remove any empty translations.
      const allTranslations = translationsResults.flat().filter(translation => translation.length > 0);

      if (allTranslations.length === 0) {
        // If there are no successful translations, throw an error.
        throw new Error('All translation services failed.');
      }

      const selectedTranslation = await showTranslationChoices(allTranslations);
      if (!selectedTranslation) return;

      await replaceSelectedText(selectedTranslation);
    }
  ).catch(error => {
    // This will only be triggered if all translation services fail.
    vscode.window.showErrorMessage(`Translation failed: ${error}`);
  });
}

export const translateToChinese = () => translateText('ZH', 'EN');
export const translateToEnglish = () => translateText('EN', 'ZH');