import fetch from "node-fetch";
class DoubaoService {
  public platform: string = "doubao";
  private apiKey: string;
  private model: string;

  private url: string;

  constructor() {
    this.url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    this.apiKey = process.env.VOLCENGINE_DouBao_APIKEY as string;
    this.model = process.env.VOLCENGINE_DouBao_ENDPOINT_ID as string;
  }

  async chat(options: any) {
    const data = {
      model: this.model,
      stream: false,
      ...options,
    };

    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (data.stream) {
      return this.handleStreamResponse(response);
    } else {
      const responseData = await response.json();
      console.log("模型返回的数据-->", responseData);
      return responseData;
    }
  }

  private async handleStreamResponse(response: any) {
    const reader = response.body?.getReader();
    let result = "";
    while (true) {
      const { done, value } = await reader?.read();
      if (done) break;
      result += new TextDecoder().decode(value);
    }
    return JSON.parse(result);
  }

  generatePrompt(text: string) {
    const prompt = `
      - Role: 编程语言专家
      - Background: 用户需要将中文文案转换成小驼峰形式的函数名称，以便于在编程中使用。
      - Profile: 你是一位精通多种编程语言的专家，了解不同编程语言的命名规范。
      - Skills: 了解小驼峰命名法，能够将中文文案翻译成英文，并转换为小驼峰形式。
      - Goals: 设计一个函数，能够接受中文文案作为输入，输出小驼峰形式的函数名称。
      - Constrains: 转换过程需要保持原文案的语义，同时符合小驼峰命名法的规范。
      - OutputFormat: 输出应为小驼峰形式的字符串。
      - Workflow:
        1. 接收中文文案作为输入。
        2. 将中文文案翻译成英文。
        3. 转换英文为小驼峰形式。
        4. 输出结果。
    `;
    const data = {
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: `请你将我这个文案 ${text} 转成函数名称, 小驼峰形式，出我 5 个参考的变量名称，只返回变量名称，用英文逗号分割，不要解释！切记不要生成类似于 variableName、variableName1、variableName2等直接添加序号`,
        },
      ],
      stream: false,
    };
    return data;
  }

  async genFuncName(text: string) {
    const prompt = this.generatePrompt(text)
    
    return this.chat(prompt)
  }

  cleanAccessToken() {
    console.log('cleanAccessToken')
  }
}

export default DoubaoService;
