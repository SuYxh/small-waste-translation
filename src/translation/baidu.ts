import fetch from 'node-fetch'; // 确保已经安装了node-fetch
import { createHash } from 'crypto';
import { ITranslationService, ITranslateTextResult } from './type';
import { showErrorMessage, genErrorMsg, addPlatformFlag, convertTranslationResults } from '@/utils';

// console.log('BAIDU_APP_ID', process.env.BAIDU_APP_ID)
// console.log('BAIDU_APP_KEY', process.env.BAIDU_APP_KEY)

function MD5(text: string): string {
    return createHash('md5').update(text).digest('hex');
}

export class BaiduService implements ITranslationService {
    public platform: string = 'baidu';
    private appid: string;
    private key: string;

    constructor() {
        this.appid = process.env.BAIDU_APP_ID as string;
        this.key = process.env.BAIDU_APP_KEY as string;
    }

    getPlatform(): string {
        return this.platform;
    }

    sign(text: string, salt: string) {
        const str1 = this.appid + text + salt + this.key;
        const sign = MD5(str1);
        return sign
    }

    /**
     * 调用DeepL API翻译文本
     * @param text 要翻译的文本
     * @param sourceLang 源语言代码（如"EN"）
     * @param targetLang 目标语言代码（如"ZH"）
     * @returns 翻译结果数组
     */
    async translateText(text: string, targetLang: string, sourceLang: string): Promise<ITranslateTextResult[]> {
        const url = 'http://api.fanyi.baidu.com/api/trans/vip/translate';
        const salt = new Date().getTime().toString();

        const params = new URLSearchParams({
            q: text,
            appid: this.appid,
            salt: salt,
            from: sourceLang.toLocaleLowerCase(),
            to: targetLang.toLocaleLowerCase(),
            sign: this.sign(text, salt),
        });

        try {
            const response = await fetch(`${url}?${params}`, { method: 'GET' });
            const data = await response.json() as any;
            if (data.trans_result) {
                // 添加标识
                const _data = data.trans_result.map((t: any) => addPlatformFlag(t.dst, this.platform));
                // 转换结构
                return convertTranslationResults(_data, text, sourceLang, targetLang, this.platform)
            } else {
                console.log('baidu translation error', data)
                const errorMsg = genErrorMsg(`baidu translation error: ${data.error_msg}`)
                console.error(errorMsg);
                showErrorMessage(errorMsg)
                return []
            }
        } catch (error) {
            const errorMsg = genErrorMsg('baidu translation failed')
            console.error(errorMsg);
            showErrorMessage(errorMsg)
            return [];
        }
    }
}