import fetch from 'node-fetch';
import { DIContainer, LocalStorageService } from '@/utils';
import { LOCAL_STORAGE_SERVICE, OPENAI_ACCESS_TOKEN } from '@/const';

export async function getOpenaiAccessToken(): Promise<any> {
  return new Promise<void>((resolve, reject) => {
    const postData = {
      mobile: process.env.USERNAME,
      password: process.env.PASSWORD,
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


export async function handleOpenaiAccessToken() {
  // 获取本地服务
  const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);

  const openaiAccessToken = localStorageService.get(OPENAI_ACCESS_TOKEN)
  if (!openaiAccessToken) {
    try {
      const accessData = await getOpenaiAccessToken()
      // 24 * 60 * 60 * 1000 表示 24小时， 此时设置过期时间为20天
      localStorageService.set(OPENAI_ACCESS_TOKEN, accessData.data, 24 * 60 * 60 * 1000 * 20)
    } catch (error) {
      console.log('获取openai token失败', error);
    }
  }
}


export async function chatProgress(text: string): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const localStorageService = DIContainer.instance.get<LocalStorageService>(LOCAL_STORAGE_SERVICE);

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

    const url = 'https://openai.huat.xyz/chat-process';

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorageService.get(OPENAI_ACCESS_TOKEN)}`
      }
    })
      .then(response => {
        if (!response.ok) {
          reject(Error('chatProgress -- Network response was not ok'))
        }
        return response.buffer();
        // return response.json();
      })
      .then((buffer: any) => {
        resolve(buffer)
      })
      .catch(error => {
        reject(new Error(`chatProgress -- There was a problem with your fetch operation: ${error}`))
      });
  })
}