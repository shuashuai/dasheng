// 🎭 演示模式 - 模拟翻译（无需 API Key）

import type { AIProvider, TranslateOptions, CompleteOptions } from './ai-provider.js';

/**
 * 模拟翻译提供者 - 用于演示和测试
 * 无需真实 API Key，返回模拟翻译结果
 */
export class MockProvider implements AIProvider {
  name = 'Mock（演示模式）';

  // 简单的模拟翻译字典
  private mockTranslations: Record<string, Record<string, string>> = {
    'zh-CN': {
      'Sign In': '登录',
      'Forgot Password?': '忘记密码？',
      'This field is required': '此字段为必填项',
      'Please enter a valid email': '请输入有效的邮箱地址',
      'Network connection failed': '网络连接失败',
      'Welcome back!': '欢迎回来！',
      'Goodbye!': '再见！',
      'Username': '用户名',
      'Password': '密码',
      'Login': '登录',
      'Dasheng': '大圣',
      'An AI assistant beyond Jarvis': '超越贾维斯的 AI 助手',
      'Deep value': '深层值'
    },
    'ja-JP': {
      'Sign In': 'サインイン',
      'Forgot Password?': 'パスワードを忘れた？',
      'This field is required': 'このフィールドは必須です',
      'Please enter a valid email': '有効なメールアドレスを入力してください',
      'Network connection failed': 'ネットワーク接続に失敗しました',
      'Welcome back!': 'お帰りなさい！',
      'Goodbye!': 'さようなら！',
      'Username': 'ユーザー名',
      'Password': 'パスワード',
      'Login': 'ログイン',
      'Dasheng': '大聖',
      'An AI assistant beyond Jarvis': 'ジャービスを超えるAIアシスタント',
      'Deep value': '深い値'
    }
  };

  async translate(text: string, options: TranslateOptions): Promise<string> {
    const { to = 'zh-CN' } = options;
    
    // 模拟网络延迟
    await this.delay(300);
    
    // 查找模拟翻译
    const dict = this.mockTranslations[to] || this.mockTranslations['zh-CN'];
    if (dict && dict[text]) {
      return `[演示] ${dict[text]}`;
    }
    
    // 如果没有找到，返回模拟翻译格式
    return `[演示] ${text}（已翻译为${to}）`;
  }

  async translateBatch(texts: string[], options: TranslateOptions): Promise<string[]> {
    const results: string[] = [];
    for (const text of texts) {
      const translated = await this.translate(text, options);
      results.push(translated);
    }
    return results;
  }

  async complete(prompt: string, _options?: CompleteOptions): Promise<string> {
    await this.delay(500);
    return `[演示模式生成]\n\n这是根据提示生成的模拟内容：\n${prompt.slice(0, 100)}...`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
