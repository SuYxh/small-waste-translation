import fetch from "node-fetch";

export class DeepseekService {
  public platform: string = "deepseek";
  private apiKey: string;
  private model: string;
  private url: string;

  constructor() {
    this.url = "https://api.deepseek.com/chat/completions";
    this.apiKey = process.env.DEEPSEEK_API_KEY as string;
    this.model = "deepseek-chat"; // 默认模型
  }

  async chat(messages: Array<{ role: string; content: string }>, stream: boolean = false) {
    const data = {
      model: this.model,
      messages,
      stream: false,
    };

    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (stream) {
      return this.handleStreamResponse(response);
    } else {
      const responseData = await response.json();
      console.log("模型返回的数据", responseData);
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
}