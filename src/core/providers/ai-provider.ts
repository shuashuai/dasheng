import OpenAI from "openai";

export interface TranslateOptions {
  from?: string;
  to: string;
  context?: string;
}

export interface CompleteOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  translate(text: string, options: TranslateOptions): Promise<string>;
  translateBatch(texts: string[], options: TranslateOptions): Promise<string[]>;
  complete(prompt: string, options?: CompleteOptions): Promise<string>;
}

/**
 * OpenAI 翻译提供者
 * 支持标准 OpenAI API 和兼容 OpenAI 格式的第三方服务（如 Kimi、Azure 等）
 */
export class OpenAIProvider implements AIProvider {
  name = "OpenAI";
  private client: OpenAI;
  private model: string;

  constructor(config: { apiKey?: string; baseUrl?: string; model?: string }) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    const baseURL = config.baseUrl || process.env.OPENAI_BASE_URL;

    if (!apiKey) {
      throw new Error("未设置 API Key，请设置 OPENAI_API_KEY 环境变量");
    }

    // 配置 fetch 选项以处理 SSL 问题
    const fetchOptions: any = {};

    // 如果是 anyrouter，尝试修复 SSL
    if (baseURL?.includes("anyrouter")) {
      console.log("🔧 检测到 AnyRouter，启用 SSL 兼容模式...");
      // Node.js 18+ 使用原生 fetch，需要通过环境变量控制
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    this.client = new OpenAI({
      apiKey,
      baseURL,
      // @ts-expect-error - 某些版本支持
      fetchOptions,
    });

    // 根据服务商自动选择默认模型
    if (config.model) {
      this.model = config.model;
    } else if (baseURL?.includes("moonshot")) {
      this.model = "moonshot-v1-8k";
    } else if (baseURL?.includes("deepseek")) {
      this.model = "deepseek-chat";
    } else {
      this.model = "gpt-3.5-turbo";
    }
  }

  async translate(text: string, options: TranslateOptions): Promise<string> {
    const { from = "auto", to, context } = options;

    const contextPrompt = context ? `\n翻译语境：${context}` : "";

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: `你是一个专业的翻译助手。请将文本从 ${from} 翻译成 ${to}。${contextPrompt}\n只返回翻译结果，不要解释。`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || text;
  }

  async translateBatch(
    texts: string[],
    options: TranslateOptions,
  ): Promise<string[]> {
    // 批量翻译，每次最多 20 条
    const batchSize = 20;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((text) => this.translate(text, options)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  async complete(
    prompt: string,
    options: CompleteOptions = {},
  ): Promise<string> {
    const { temperature = 0.7, maxTokens = 2000 } = options;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || "";
  }
}

/**
 * 创建 AI Provider 工厂函数
 */
export function createAIProvider(config: {
  provider: "openai" | "anthropic" | "local";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}): AIProvider {
  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config);
    default:
      throw new Error(`不支持的 AI 提供者: ${config.provider}`);
  }
}

// 导出其他提供者
export { MockProvider } from "./mock-provider.js";
