// ⚙️ 配置管理器

import * as vscode from 'vscode';

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface TranslationConfig {
  defaultTargetLangs: string[];
  preserveFormat: boolean;
}

export interface CoverConfig {
  defaultStyle: 'tech' | 'minimal' | 'gradient' | 'illustration' | 'business';
  defaultRatio: string;
}

export interface BlogConfig {
  defaultStyle: 'release' | 'tutorial' | 'news' | 'deep-dive' | 'story';
}

export class ConfigManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('dasheng');
  }

  /**
   * 获取配置项
   */
  get<T>(key: string, defaultValue?: T): T {
    return this.config.get<T>(key, defaultValue as T);
  }

  /**
   * 设置配置项
   */
  async set(key: string, value: unknown, global = true): Promise<void> {
    await this.config.update(key, value, global);
  }

  /**
   * 获取 AI 配置
   */
  getAIConfig(): AIConfig {
    return {
      provider: this.get('ai.provider', 'openai'),
      apiKey: this.getAIApiKey(),
      baseUrl: this.get('ai.baseUrl', ''),
      model: this.get('ai.model', 'gpt-3.5-turbo')
    };
  }

  /**
   * 获取 API Key（优先从环境变量读取）
   */
  private getAIApiKey(): string {
    // 优先从环境变量读取
    const envKey = process.env.DASHENG_API_KEY || process.env.OPENAI_API_KEY;
    if (envKey) {
      return envKey;
    }
    // 其次从配置读取
    return this.get('ai.apiKey', '');
  }

  /**
   * 获取翻译配置
   */
  getTranslationConfig(): TranslationConfig {
    return {
      defaultTargetLangs: this.get('translation.defaultTargetLangs', ['zh-CN', 'ja-JP', 'ko-KR']),
      preserveFormat: this.get('translation.preserveFormat', true)
    };
  }

  /**
   * 获取封面配置
   */
  getCoverConfig(): CoverConfig {
    return {
      defaultStyle: this.get('cover.defaultStyle', 'tech'),
      defaultRatio: this.get('cover.defaultRatio', '16:9')
    };
  }

  /**
   * 获取博客配置
   */
  getBlogConfig(): BlogConfig {
    return {
      defaultStyle: this.get('blog.defaultStyle', 'release')
    };
  }

  /**
   * 检查 AI 配置是否有效
   */
  isAIConfigValid(): boolean {
    const aiConfig = this.getAIConfig();
    return !!aiConfig.apiKey;
  }

  /**
   * 显示配置缺失提示
   */
  async showConfigMissingPrompt(): Promise<void> {
    const result = await vscode.window.showWarningMessage(
      '⚠️ 未配置 AI API Key，请先在设置中配置',
      '打开设置',
      '查看文档'
    );

    if (result === '打开设置') {
      void vscode.commands.executeCommand('workbench.action.openSettings', 'dasheng.ai');
    } else if (result === '查看文档') {
      void vscode.env.openExternal(vscode.Uri.parse('https://github.com/shuashuai/dasheng#配置'));
    }
  }

  /**
   * 监听配置变化
   */
  onChange(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('dasheng')) {
        this.config = vscode.workspace.getConfiguration('dasheng');
        callback(e);
      }
    });
  }
}
