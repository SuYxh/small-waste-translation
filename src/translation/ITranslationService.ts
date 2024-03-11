// src/translation/ITranslationService.ts

export interface ITranslationService {
  translateText(text: string, targetLang: string, sourceLang?: string): Promise<string[]>;
}
