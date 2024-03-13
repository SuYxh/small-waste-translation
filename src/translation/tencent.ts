import fetch from 'node-fetch';
import { createHmac, createHash } from 'crypto';
import { showErrorMessage, genErrorMsg, convertTranslationResults, addPlatformFlag } from '@/utils';
import type { ITranslationService, ITranslateTextResult } from '@/type';

// console.log('TENCENT_SECRET_ID', process.env.TENCENT_SECRET_ID)
// console.log('TENCENT_SECRET_KEY', process.env.TENCENT_SECRET_KEY)


export class TencentService implements ITranslationService {
  private secretId = process.env.TENCENT_SECRET_ID as string;
  private secretKey = process.env.TENCENT_SECRET_KEY as string;
  private endpoint = 'tmt.tencentcloudapi.com';
  private region = 'ap-beijing';
  private action = 'TextTranslate';
  private version = '2018-03-21';
  public platform: string = 'tencent';


  getPlatform(): string {
    return this.platform;
  }

  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<ITranslateTextResult[]> {
    sourceLang = sourceLang.toLocaleLowerCase()
    targetLang = targetLang.toLocaleLowerCase()

    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10);
    const service = 'tmt';
    
    const host = this.endpoint;
    const algorithm = 'TC3-HMAC-SHA256';
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
    const signedHeaders = 'content-type;host';
    const payload = JSON.stringify({
      SourceText: text,
      Source: sourceLang,
      Target: targetLang,
      ProjectId: 0
    });
    const hashedRequestPayload = createHash('sha256').update(payload).digest('hex');
    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

    // ************* 步骤 2：拼接待签名字符串 *************
    const credentialScope = `${date}/${service}/tc3_request`;
    const hashedCanonicalRequest = createHash('sha256').update(canonicalRequest).digest('hex');
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

    // ************* 步骤 3：计算签名 *************
    const secretDate = createHmac('sha256', `TC3${this.secretKey}`).update(date).digest();
    const secretService = createHmac('sha256', secretDate).update(service).digest();
    const secretSigning = createHmac('sha256', secretService).update('tc3_request').digest();
    const signature = createHmac('sha256', secretSigning).update(stringToSign).digest('hex');

    // ************* 步骤 4：拼接 Authorization *************
    const authorization = `${algorithm} Credential=${this.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    try {
      const response = await fetch(`https://${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
          'Host': this.endpoint,
          'X-TC-Action': this.action,
          'X-TC-Timestamp': timestamp.toString(),
          'X-TC-Version': this.version,
          'X-TC-Region': this.region,
        },
        body: payload
      });

      const data = await response.json() as any;
      if (data.Response && data.Response.TargetText) {
        // 添加标识
        const _data = [data.Response.TargetText].map((t: any) => addPlatformFlag(t, this.platform));
        // 转换结构
        return convertTranslationResults(_data, text, sourceLang, targetLang, this.platform)
      } else {
        // 接口成功，但是返回的数据不正常
        if (data.Response && data.Response.Error) {
          const errorMsg = genErrorMsg(`Tencent translation error: ${data.Response.Error.Message}`)
          showErrorMessage(errorMsg)
          return []
        }
      }
      return [];
    } catch (error: any) {
      // 接口/逻辑错误
      const errorMsg = genErrorMsg(`Tencent translation error: ${error.message}`)
      showErrorMessage(errorMsg)
      console.error(errorMsg);
      return [];
    }
  }
}