// src/translation/volcanoService.js

import { ITranslationService } from './ITranslationService';
import crypto, { Hmac } from "crypto";
import * as util from "util";
import * as url from "url";
import fetch, { Response } from "node-fetch"; // 确保已安装node-fetch的@types或使用支持TypeScript的版本
import qs from "querystring";


const k_access_key = '-'; // 从火山控制台获取
const k_secret_key = '-'; // 从火山控制台获取
const endpoint = 'https://translate.volcengineapi.com';
const action = 'TranslateText';
const version = '2020-06-01';


const debuglog: (msg: string) => void = util.debuglog('signer');

interface SignParams {
    headers?: Record<string, string>;
    method?: string;
    query?: Record<string, string>;
    accessKeyId: string;
    secretAccessKey: string;
    serviceName: string;
    region: string;
    pathName?: string;
    needSignHeaderKeys?: string[];
    bodySha?: string;
}

/**
 * 不参与加签过程的 header key
 */
const HEADER_KEYS_TO_IGNORE: Set<string> = new Set([
    "authorization",
    "content-type",
    "content-length",
    "user-agent",
    "presigned-expires",
    "expect",
]);

// do request example
async function doRequest(): Promise<void> {
    const signParams: SignParams = {
        headers: {
            // x-date header 是必传的
            ["X-Date"]: getDateTimeNow(),
        },
        method: 'GET',
        query: {
            Version: '2018-01-01',
            Action: 'ListPolicies',
        },
        accessKeyId: '*******',
        secretAccessKey: '**********',
        serviceName: 'iam',
        region: 'cn-beijing',
    };
    // 正规化 query object， 防止串化后出现 query 值为 undefined 情况
    for (const [key, val] of Object.entries(signParams.query)) {
        if (val === undefined || val === null) {
            signParams.query[key] = '';
        }
    }
    const authorization: string = sign(signParams);
    const res: Response = await fetch(`https://iam.volcengineapi.com/?${qs.stringify(signParams.query)}`, {
        headers: {
            ...signParams.headers,
            'Authorization': authorization,
        },
        method: signParams.method,
    });
    const responseText: string = await res.text();
    console.log(responseText);
}

function sign(params: SignParams): string {
    const {
        headers = {},
        query = {},
        region = '',
        serviceName = '',
        method = '',
        pathName = '/',
        accessKeyId = '',
        secretAccessKey = '',
        needSignHeaderKeys = [],
        bodySha,
    } = params;
    const datetime: string = headers["X-Date"]!;
    const date: string = datetime.substring(0, 8); // YYYYMMDD
    // 创建正规化请求
    const [signedHeaders, canonicalHeaders]: [string, string] = getSignHeaders(headers, needSignHeaderKeys);
    const canonicalRequest: string = [
        method.toUpperCase(),
        pathName,
        queryParamsToString(query) || '',
        `${canonicalHeaders}\n`,
        signedHeaders,
        bodySha || hash(''),
    ].join('\n');
    const credentialScope: string = [date, region, serviceName, "request"].join('/');
    // 创建签名字符串
    const stringToSign: string = ["HMAC-SHA256", datetime, credentialScope, hash(canonicalRequest)].join('\n');
    // 计算签名
    const kDate: Buffer = hmac(secretAccessKey, date);
    const kRegion: Buffer = hmac(kDate, region);
    const kService: Buffer = hmac(kRegion, serviceName);
    const kSigning: Buffer = hmac(kService, "request");
    const signature: string = hmac(kSigning, stringToSign).toString('hex');
    debuglog('--------CanonicalString:\n%s\n--------SignString:\n%s', canonicalRequest, stringToSign);

    return [
        "HMAC-SHA256",
        `Credential=${accessKeyId}/${credentialScope},`,
        `SignedHeaders=${signedHeaders},`,
        `Signature=${signature}`,
    ].join(' ');
}

function hmac(secret: string | Buffer, message: string): Buffer {
    return crypto.createHmac('sha256', secret).update(message, 'utf8').digest();
}

function hash(s: string): string {
    return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function queryParamsToString(params: Record<string, string | string[]>): string {
    return Object.keys(params)
        .sort()
        .map((key) => {
            const val = params[key];
            if (typeof val === 'undefined' || val === null) {
                return undefined;
            }
            const escapedKey = uriEscape(key);
            if (!escapedKey) {
                return undefined;
            }
            if (Array.isArray(val)) {
                return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
            }
            return `${escapedKey}=${uriEscape(val)}`;
        })
        .filter((v): v is string => v !== undefined)
        .join('&');
}

function getSignHeaders(originHeaders: Record<string, string>, needSignHeaders?: string[]): [string, string] {
    function trimHeaderValue(header: string): string {
        return header.trim().replace(/\s+/g, ' ');
    }

    let h: string[] = Object.keys(originHeaders);
    // 根据 needSignHeaders 过滤
    if (needSignHeaders) {
        const needSignSet: Set<string> = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
        h = h.filter((k) => needSignSet.has(k.toLowerCase()));
    }
    // 根据 ignore headers 过滤
    h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
    const signedHeaderKeys: string = h
        .map((k) => k.toLowerCase())
        .sort()
        .join(';');
    const canonicalHeaders: string = h
        .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
        .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
        .join('\n');
    return [signedHeaderKeys, canonicalHeaders];
}

function uriEscape(str: string): string {
    try {
        return encodeURIComponent(str)
            .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
            .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
    } catch (e) {
        return '';
    }
}

function getDateTimeNow(): string {
    const now: Date = new Date();
    return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function getBodySha(body: string | url.URLSearchParams | Buffer): string {
    const hash: crypto.Hash = crypto.createHash('sha256');
    if (typeof body === 'string') {
        hash.update(body);
    } else if (body instanceof url.URLSearchParams) {
        hash.update(body.toString());
    } else if (Buffer.isBuffer(body)) {
        hash.update(body);
    }
    return hash.digest('hex');
}

export { doRequest, sign, hmac, hash, queryParamsToString, getSignHeaders, uriEscape, getDateTimeNow, getBodySha };



export class VolcanoService implements ITranslationService {
  async translateText(textList: string, targetLang: string, sourceLang?: string,) {
    const url = `${endpoint}/?Action=${action}&Version=${version}`;
    const body = {
      SourceLanguage: sourceLang,
      TargetLanguage: targetLang,
      TextList: [textList],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Date': new Date().toUTCString(),
          'Authorization': `HMAC-SHA256 AccessKey=${k_access_key} SecretKey=${k_secret_key}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json() as any;
      console.log('VolcanoService-->', data); // 或处理返回的翻译结果
      return ['sadasdas']; // 或返回处理后的结果
    } catch (error) {
      console.error('Error calling VolcanoService:', error);
      return []; // 或根据需要处理错误
    }
  }
}
