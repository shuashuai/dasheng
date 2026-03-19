// 🤖 AI 服务提供者 - 封装 OpenAI 调用

import OpenAI from 'openai';
import { Logger } from './logger';

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
 */
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(config: { apiKey?: string; baseUrl?: string; model?: string }) {
    const apiKey = config.apiKey;
    const baseURL = config.baseUrl;

    if (!apiKey) {
      throw new Error('未设置 API Key');
    }

    this.client = new OpenAI({ apiKey, baseURL });

    // 根据服务商自动选择默认模型
    if (config.model) {
      this.model = config.model;
    } else if (baseURL?.includes('moonshot')) {
      this.model = 'moonshot-v1-8k';
    } else if (baseURL?.includes('deepseek')) {
      this.model = 'deepseek-chat';
    } else {
      this.model = 'gpt-3.5-turbo';
    }
  }

  async translate(text: string, options: TranslateOptions): Promise<string> {
    const { from = 'auto', to, context } = options;
    const contextPrompt = context ? `\n翻译语境：${context}` : '';

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `你是一个专业的翻译助手。请将文本从 ${from} 翻译成 ${to}。${contextPrompt}\n只返回翻译结果，不要解释。`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3
      });

      return response.choices[0]?.message?.content || text;
    } catch (error) {
      Logger.error('翻译失败', error as Error);
      throw error;
    }
  }

  async translateBatch(texts: string[], options: TranslateOptions): Promise<string[]> {
    const batchSize = 20;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(text => this.translate(text, options)));
      results.push(...batchResults);
    }

    return results;
  }

  async complete(prompt: string, options: CompleteOptions = {}): Promise<string> {
    const { temperature = 0.7, maxTokens = 2000 } = options;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      Logger.error('生成失败', error as Error);
      throw error;
    }
  }
}

/**
 * Mock 提供者（用于演示和测试）
 */
export class MockProvider implements AIProvider {
  name = 'Mock';

  async translate(text: string, options: TranslateOptions): Promise<string> {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 简单的模拟翻译
    if (options.to === 'zh-CN') {
      return `[中文翻译] ${text}`;
    } else if (options.to === 'ja-JP') {
      return `[日本語訳] ${text}`;
    } else if (options.to === 'ko-KR') {
      return `[한국어 번역] ${text}`;
    }
    return `[Translated to ${options.to}] ${text}`;
  }

  async translateBatch(texts: string[], options: TranslateOptions): Promise<string[]> {
    return Promise.all(texts.map(text => this.translate(text, options)));
  }

  async complete(prompt: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `# 生成的内容\n\n这是根据提示生成的模拟内容：\n\n${prompt.slice(0, 100)}...\n\n（这是演示模式，请在设置中配置真实的 AI API Key）`;
  }
}

/**
 * 创建 AI Provider 工厂函数
 */
export function createAIProvider(config: {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}): AIProvider {
  if (!config.apiKey) {
    Logger.warn('未设置 API Key，使用 Mock 模式');
    return new MockProvider();
  }

  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    default:
      Logger.warn(`不支持的 AI 提供者: ${config.provider}，使用 Mock 模式`);
      return new MockProvider();
  }
}
