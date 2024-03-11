import * as vscode from 'vscode';
import fetch from 'node-fetch'; // 确保已经安装了node-fetch

interface TranslationResult {
    translations: Array<{ text: string }>;
}

export class DeepLService {
    private apiKey: string;
    private baseUrl: string;
    private translateAPI: string;


    constructor() {
        this.apiKey = '16acc099-70f2-42fd-a6ae-b30c9acf7877:fx';
        this.baseUrl = 'https://api-free.deepl.com'
        this.translateAPI = '/v2/translate'
    }

    genUrl(text: string, sourceLang: string, targetLang: string): string {
        return `${this.baseUrl}${this.translateAPI}?auth_key=${this.apiKey}&text=${encodeURIComponent(text)}&source_lang=${sourceLang}&target_lang=${targetLang}`;
    }

    /**
     * 调用DeepL API翻译文本
     * @param text 要翻译的文本
     * @param sourceLang 源语言代码（如"EN"）
     * @param targetLang 目标语言代码（如"ZH"）
     * @returns 翻译结果数组
     */
    async translateText(text: string, sourceLang: string, targetLang: string): Promise<string[]> {
        const url = this.genUrl(text, sourceLang, targetLang)

        try {
            const response = await fetch(url, { method: 'POST' });
            const data: TranslationResult = await response.json() as any;
            return data.translations.map(t => t.text);
        } catch (error) {
            console.error('Translation error:', error);
            vscode.window.showErrorMessage('Translation failed');
            return [];
        }
    }

    translateToEnglish(text: string): Promise<string[]> {
        return this.translateText(text, 'ZH', 'EN');
    }

    translateToChinese(text: string): Promise<string[]> {
        return this.translateText(text, 'EN', 'ZH');
    }
}