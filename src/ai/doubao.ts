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

export default DoubaoService;
