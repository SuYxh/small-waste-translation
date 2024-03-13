import fetch from 'node-fetch';
import { DIContainer, LocalStorageService, showErrorMessage } from '@/utils';
import { LOCAL_STORAGE_SERVICE, OPENAI_ACCESS_TOKEN } from '@/const';
import { ConfigService } from '@/utils/ConfigService';
import { IAIService } from '@/type';

export class OpenaiService implements IAIService {
  public validity: number = 24 * 60 * 60 * 1000;
  public platform: string = 'openai';
  public accessToken: string = '';
  constructor() {
    // handleAccessToken 方法中使用到了 DIContainer 中的服务，所以这里采用异步，等待 DIContainer 初始化完成
    setTimeout(() => {
      this.handleAccessToken();
    }, 0);
  }

  getAccessToken(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      const username = ConfigService.getUsername()
      const password = ConfigService.getPassword()

      const postData = {
        mobile: username || process.env.USERNAME,
        password: password || process.env.PASSWORD,
      };
      const url = 'https://openai.huat.xyz/v1/login';
  
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            reject(Error('Network response was not ok'))
          }
          return response.json();
        })
        .then((data: any) => {
          resolve(data)
        })
        .catch(error => {
          reject(new Error(`There was a problem with your fetch operation: ${error}`))
        });
    })
  }

  cleanAccessToken() {
    const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
    localStorageService.delete(this.platform)
  }

  async handleAccessToken() {
    // 获取本地服务
    const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
  
    const openaiAccessToken = localStorageService.get(this.platform)

    if (!openaiAccessToken) {
      try {
        const accessData = await this.getAccessToken()
        if (accessData.data) {
           // 24 * 60 * 60 * 1000 表示 24小时， 此时设置过期时间为20天
          localStorageService.set(this.platform, accessData.data, this.validity)
          this.accessToken = accessData.data;
        } else {
          // 说明 token 获取失败
          console.log('accessToken 获取失败', accessData)
          showErrorMessage('您配置的用户信息错误！')
        }       
      } catch (error) {
        console.log('获取openai token失败', error);
      }
    }
  }

  async chat(postData: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);
      let accessToken = localStorageService.get(OPENAI_ACCESS_TOKEN)
      // 如果 token 不存在，则重新获取
      if (!accessToken) {
        const accessData = await this.getAccessToken()
        if (accessData.data) {
          accessToken = accessData.data;
        } else {
          console.log('chat-accessToken 获取失败', accessData)
          reject(new Error(accessData.message))
        }
      }

      const url = 'https://openai.huat.xyz/chat-process';
  
      console.log('accessToken-->', accessToken)

      fetch(url, {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })
        .then(response => {
          if (!response.ok) {
            reject(Error('openai-chat -- Network response was not ok'))
          }
          return response.arrayBuffer()
        })
        .then((buffer: any) => {
          resolve(buffer)
        })
        .catch(error => {
          reject(new Error(`openai-chat-error: ${error}`))
        });
    })
  }

  async genFuncName(text: string) {
    const postData = {
      "prompt": `
      你是一个翻译专家，尤其擅长技术类的翻译。我需要你将这个中文【${text}】翻译成一个符合前端开发规范的函数名称，需要你提供3-5个，请你以结构化的数据给我, 只要json格式的数据即可： 
        {
          data: [name1, name2,...]
        }
      `,
      "options": {},
      "systemMessage": "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      "temperature": 0.8,
      "top_p": 1,
      "model": "gpt-3.5-turbo"
    }
    
    console.log('genFuncName-->postData', postData)
    return this.chat(postData)
  }
}