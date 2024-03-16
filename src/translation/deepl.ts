import fetch from 'node-fetch'; // 确保已经安装了node-fetch
import { showErrorMessage, genErrorMsg, addPlatformFlag, convertTranslationResults} from '@/utils';
import type { ITranslationService, ITranslateTextResult } from '@/type';
import { DIContainer, LocalStorageService } from '@/service';
import { LOCAL_STORAGE_SERVICE, DEEPL_KEY } from '@/const';

// console.log('DEEPL_API_KEY', process.env.DEEPL_API_KEY)

export class DeepLService implements ITranslationService {
    public platform: string = 'deepl';
    private apiKey: string;
    private baseUrl: string;
    private translateAPI: string;


    constructor() {
        this.apiKey = process.env.DEEPL_API_KEY as string;
        this.baseUrl = 'https://api-free.deepl.com'
        this.translateAPI = '/v2/translate'
    }

    getPlatform(): string {
        return this.platform;
    }

    genUrl(text: string, sourceLang: string, targetLang: string): string {
        const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
        const userApiKey = localStorageService.get(DEEPL_KEY);
        // 优先使用用户设置
        const apiKey = userApiKey ?? this.apiKey;
        return `${this.baseUrl}${this.translateAPI}?auth_key=${apiKey}&text=${encodeURIComponent(text)}&source_lang=${sourceLang}&target_lang=${targetLang}`;
    }

    /**
     * 调用DeepL API翻译文本
     * @param text 要翻译的文本
     * @param sourceLang 源语言代码（如"EN"）
     * @param targetLang 目标语言代码（如"ZH"）
     * @returns 翻译结果数组
     */
    async translateText(text: string, targetLang: string, sourceLang: string): Promise<ITranslateTextResult[]> {
        const url = this.genUrl(text, sourceLang, targetLang)

        try {
            const response = await fetch(url, { method: 'POST' });
            const data = await response.json() as any;

            if (data.translations) {
                // 添加标识
                const _data = data.translations.map((t: any) => addPlatformFlag(t.text, this.platform));
                // 转换结构
                return convertTranslationResults(_data, text, sourceLang, targetLang, this.platform)
            } else {
                const errorMsg = genErrorMsg('deepl translation error')
                console.error(errorMsg);
                showErrorMessage(errorMsg)
                return []
            }
        } catch (error) {
            const errorMsg = genErrorMsg('deepl translation fail')
            console.error(errorMsg);
            showErrorMessage(errorMsg)
            return [];
        }
    }

    async verifyApiKey(key: string): Promise<boolean> {
        const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
        await localStorageService.set(DEEPL_KEY, key);

        const list: any = await this.translateText('test', 'ZH', 'EN')
        if (list?.length > 0) {
            return true
        } else {
            await localStorageService.delete(DEEPL_KEY);
            return false
        }
    }
}