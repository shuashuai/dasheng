// 🌐 七十二变·语言通 - YAML 翻译服务

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname, basename, extname, join } from 'path';
import chalk from 'chalk';
import type { ContextMap } from '../../types/index.js';
import {
  parseYaml,
  stringifyYaml,
  compareYamlKeys,
  extractKeys,
  getValueByPath,
  setValueByPath
} from '../utils/yaml-utils.js';
import { loadContextMap, getKeyContext, extractContextFromKey } from '../utils/context-utils.js';
import { createAIProvider } from '../providers/ai-provider.js';
import { MockProvider } from '../providers/mock-provider.js';

export interface TranslateResult {
  file: string;
  added: number;
  removed: number;
  updated: number;
  unchanged: number;
}

export class YamlTranslator {
  private aiProvider;
  private contextMap: ContextMap = { exact: {}, pattern: {} };
  private dryRun: boolean = false;
  private force: boolean = false;

  constructor(config: {
    provider: 'openai' | 'anthropic' | 'local';
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    contextMapPath?: string;
    mock?: boolean;
  }) {
    // 如果没有 API Key 或指定 mock，使用演示模式
    if (config.mock || !config.apiKey) {
      this.aiProvider = new MockProvider();
    } else {
      this.aiProvider = createAIProvider(config);
    }
    
    if (config.contextMapPath && existsSync(config.contextMapPath)) {
      this.contextMap = loadContextMap(config.contextMapPath);
    }
  }

  setDryRun(dryRun: boolean) {
    this.dryRun = dryRun;
  }

  setForce(force: boolean) {
    this.force = force;
  }

  /**
   * 同步翻译 YAML 文件
   */
  async translate(
    baseFilePath: string,
    targetDir: string,
    targetLangs?: string[]
  ): Promise<TranslateResult[]> {
    const results: TranslateResult[] = [];

    // 1. 读取基础文件
    const baseContent = readFileSync(baseFilePath, 'utf-8');
    const baseData = parseYaml(baseContent);
    const _baseKeys = extractKeys(baseData);

    console.log(chalk.blue(`基础文件: ${baseFilePath}`));
    console.log(chalk.gray(`共有 ${_baseKeys.length} 个 key\n`));

    // 2. 确定目标语言
    const targetLanguages = targetLangs || this.detectTargetLanguages(targetDir);
    
    if (targetLanguages.length === 0) {
      console.log(chalk.yellow('未找到目标语言文件'));
      return results;
    }

    console.log(chalk.blue(`目标语言: ${targetLanguages.join(', ')}\n`));

    // 3. 处理每个目标语言
    const baseKeysList = extractKeys(baseData);
    for (const lang of targetLanguages) {
      const targetFilePath = join(targetDir, `${lang}.yaml`);
      const result = await this.syncLanguage(
        baseData,
        baseKeysList,
        targetFilePath,
        lang
      );
      results.push(result);
    }

    return results;
  }

  /**
   * 同步单个语言文件
   */
  private async syncLanguage(
    baseData: Record<string, any>,
    _baseKeys: string[],
    targetFilePath: string,
    targetLang: string
  ): Promise<TranslateResult> {
    const result: TranslateResult = {
      file: targetFilePath,
      added: 0,
      removed: 0,
      updated: 0,
      unchanged: 0
    };

    // 读取或创建目标文件
    let targetData: Record<string, any> = {};
    if (existsSync(targetFilePath)) {
      const targetContent = readFileSync(targetFilePath, 'utf-8');
      targetData = parseYaml(targetContent);
    }

    // 比较 key 差异
    const { missing, extra, same } = compareYamlKeys(baseData, targetData);

    console.log(chalk.cyan(`处理: ${basename(targetFilePath)}`));

    // 1. 处理新增（missing）- 需要翻译
    if (missing.length > 0) {
      console.log(chalk.yellow(`  新增 ${missing.length} 个 key，正在翻译...`));
      
      for (const key of missing) {
        const sourceText = getValueByPath(baseData, key);
        const translatedText = await this.translateText(
          sourceText,
          key,
          targetLang
        );
        setValueByPath(targetData, key, translatedText);
        result.added++;
      }
    }

    // 2. 处理删除（extra）- 删除目标文件多余的 key
    if (extra.length > 0) {
      console.log(chalk.yellow(`  删除 ${extra.length} 个多余 key`));
      
      for (const key of extra) {
        this.deleteKeyByPath(targetData, key);
        result.removed++;
      }
    }

    // 3. 处理强制重新翻译（force 模式）
    if (this.force && same.length > 0) {
      console.log(chalk.yellow(`  强制重新翻译 ${same.length} 个已有 key...`));
      
      for (const key of same) {
        const sourceText = getValueByPath(baseData, key);
        
        // force 模式下重新翻译所有已有 key
        const translatedText = await this.translateText(
          sourceText,
          key,
          targetLang
        );
        setValueByPath(targetData, key, translatedText);
        result.updated++;
      }
    }

    // 4. 统计不变的（force 模式下为 0）
    result.unchanged = this.force ? 0 : same.length;

    // 4. 保存文件（如果不是 dry-run）
    if (!this.dryRun) {
      // 确保目录存在
      const dir = dirname(targetFilePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(targetFilePath, stringifyYaml(targetData), 'utf-8');
      console.log(chalk.green(`  已保存: ${targetFilePath}\n`));
    } else {
      console.log(chalk.gray(`  [试演模式] 未保存\n`));
    }

    return result;
  }

  /**
   * 翻译单个文本
   */
  private async translateText(
    text: string,
    key: string,
    targetLang: string
  ): Promise<string> {
    // 1. 从 key 提取语境
    const keyContext = extractContextFromKey(key);
    const mapContext = getKeyContext(key, this.contextMap);
    
    const context = mapContext || keyContext;

    // 2. 调用 AI 翻译
    try {
      const translated = await this.aiProvider.translate(text, {
        from: 'auto',
        to: targetLang,
        context
      });

      return translated;
    } catch (error) {
      console.error(chalk.red(`翻译失败 [${key}]: ${text}`), error);
      return text; // 失败时返回原文
    }
  }

  /**
   * 检测目标语言
   * 扫描目录下所有 yaml/yml 文件
   */
  private detectTargetLanguages(targetDir: string): string[] {
    if (!existsSync(targetDir)) {
      return [];
    }

    const files = readdirSync(targetDir);
    const languages: string[] = [];

    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const lang = basename(file, extname(file));
        languages.push(lang);
      }
    }

    return languages;
  }

  /**
   * 根据路径删除 key
   */
  private deleteKeyByPath(obj: Record<string, any>, path: string): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) return;
      current = current[key];
    }

    delete current[keys[keys.length - 1]];
  }
}
