// 🌐 YAML 翻译命令 - 智能同步版

import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../utils/config';
import { createAIProvider } from '../utils/aiProvider';
import { Logger } from '../utils/logger';

// YAML 数据类型定义
interface YamlData {
  [key: string]: YamlValue;
}

type YamlValue = string | number | boolean | null | YamlData | YamlValue[];

// AI Provider 接口定义
interface TranslationOptions {
  to: string;
  context?: string;
}

interface AIProvider {
  translate(text: string, options: TranslationOptions): Promise<string>;
}

// QuickPick 语言项接口
interface LanguageItem {
  label: string;
  value: string;
  picked: boolean;
}

// 文件选择项接口
interface FilePickItem {
  label: string;
  description: string;
  detail: string;
  path: string;
}

// 差异分析结果
interface DiffResult {
  added: string[]; // 新增
  modified: string[]; // 原文修改
  removed: string[]; // 已删除
  unchanged: string[]; // 未变更
  stats: {
    added: number;
    modified: number;
    removed: number;
    unchanged: number;
    total: number;
  };
}

// 同步模式
enum SyncMode {
  Smart = 'smart', // 智能同步
  Incremental = 'incremental', // 仅增量
  Full = 'full' // 全量重译
}

export class YamlTranslateCommand {
  constructor(private configManager: ConfigManager) {}

  /**
   * 执行完整的 YAML 翻译流程
   */
  async execute(): Promise<void> {
    if (!this.configManager.isAIConfigValid()) {
      await this.configManager.showConfigMissingPrompt();
      return;
    }

    const baseFile = await this.selectBaseFile();
    if (!baseFile) {
      return;
    }

    const targetDir = await this.selectTargetDir();
    if (!targetDir) {
      return;
    }

    const targetLangs = await this.selectTargetLangs();
    if (!targetLangs || targetLangs.length === 0) {
      return;
    }

    await this.performTranslation(baseFile, targetDir, targetLangs);
  }

  /**
   * 快速翻译（右键菜单）
   */
  async executeQuick(uri?: vscode.Uri): Promise<void> {
    let targetUri = uri;
    if (!targetUri) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        targetUri = editor.document.uri;
      } else {
        void vscode.window.showErrorMessage('请先打开一个 YAML 文件');
        return;
      }
    }

    if (!this.configManager.isAIConfigValid()) {
      await this.configManager.showConfigMissingPrompt();
      return;
    }

    const baseFile = targetUri.fsPath;
    const targetDir = path.dirname(baseFile);
    const targetLangs = this.configManager.getTranslationConfig().defaultTargetLangs;

    await this.performTranslation(baseFile, targetDir, targetLangs);
  }

  private async selectBaseFile(): Promise<string | undefined> {
    const files = await vscode.workspace.findFiles('**/*.{yaml,yml}', '**/node_modules/**');

    if (files.length === 0) {
      void vscode.window.showErrorMessage('未找到 YAML 文件');
      return;
    }

    const items: FilePickItem[] = files.map(f => ({
      label: path.basename(f.fsPath),
      description: vscode.workspace.asRelativePath(f),
      detail: f.fsPath,
      path: f.fsPath
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: '选择基础语言文件（如 en.yaml）',
      title: '🌐 YAML 翻译 - 选择源文件'
    });

    return selected?.path;
  }

  private async selectTargetDir(): Promise<string | undefined> {
    const result = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: '选择目标目录',
      title: '选择存放翻译文件的目录'
    });

    return result?.[0]?.fsPath;
  }

  private async selectTargetLangs(): Promise<string[] | undefined> {
    const config = this.configManager.getTranslationConfig();
    const allLangs: LanguageItem[] = [
      { label: '简体中文', value: 'zh-CN', picked: config.defaultTargetLangs.includes('zh-CN') },
      { label: '繁体中文', value: 'zh-TW', picked: config.defaultTargetLangs.includes('zh-TW') },
      { label: 'English', value: 'en-US', picked: config.defaultTargetLangs.includes('en-US') },
      { label: '日本語', value: 'ja-JP', picked: config.defaultTargetLangs.includes('ja-JP') },
      { label: '한국어', value: 'ko-KR', picked: config.defaultTargetLangs.includes('ko-KR') },
      { label: 'Français', value: 'fr-FR', picked: config.defaultTargetLangs.includes('fr-FR') },
      { label: 'Deutsch', value: 'de-DE', picked: config.defaultTargetLangs.includes('de-DE') },
      { label: 'Español', value: 'es-ES', picked: config.defaultTargetLangs.includes('es-ES') },
      { label: 'Русский', value: 'ru-RU', picked: config.defaultTargetLangs.includes('ru-RU') },
      { label: 'Italiano', value: 'it-IT', picked: config.defaultTargetLangs.includes('it-IT') },
      { label: 'Português', value: 'pt-BR', picked: config.defaultTargetLangs.includes('pt-BR') },
      { label: 'العربية', value: 'ar-SA', picked: config.defaultTargetLangs.includes('ar-SA') }
    ];

    const selected = await vscode.window.showQuickPick(allLangs, {
      canPickMany: true,
      placeHolder: '选择目标语言（可多选）',
      title: '🌐 YAML 翻译 - 选择目标语言'
    });

    return selected?.map(s => s.value);
  }

  /**
   * 分析差异
   */
  private analyzeDiff(baseData: YamlData, targetData: YamlData): DiffResult {
    const baseKeys = this.extractAllKeys(baseData);
    const targetKeys = this.extractAllKeys(targetData);

    const added: string[] = [];
    const modified: string[] = [];
    const removed: string[] = [];
    const unchanged: string[] = [];

    // 检查新增和修改
    for (const key of baseKeys) {
      const baseValue = this.getValueByPath(baseData, key);
      const targetValue = this.getValueByPath(targetData, key);

      if (targetValue === undefined) {
        // 目标不存在 = 新增
        added.push(key);
      } else if (typeof baseValue === 'string' && typeof targetValue === 'string') {
        // 简单字符串比较检测变更
        if (baseValue.trim() !== targetValue.trim()) {
          // 原文可能变更（注意：这里无法确定是原文变还是翻译不同）
          // 我们假设如果基础文件有值，就检查是否相等
          modified.push(key);
        } else {
          unchanged.push(key);
        }
      } else {
        unchanged.push(key);
      }
    }

    // 检查删除（目标有但基础没有）
    for (const key of targetKeys) {
      if (!baseKeys.includes(key)) {
        removed.push(key);
      }
    }

    return {
      added,
      modified,
      removed,
      unchanged,
      stats: {
        added: added.length,
        modified: modified.length,
        removed: removed.length,
        unchanged: unchanged.length,
        total: baseKeys.length
      }
    };
  }

  /**
   * 选择同步模式
   */
  private async selectSyncMode(diff: DiffResult): Promise<SyncMode | undefined> {
    const { stats } = diff;

    // 如果没有变更，直接返回
    if (stats.added === 0 && stats.modified === 0 && stats.removed === 0) {
      void vscode.window.showInformationMessage('✅ 所有内容已是最新，无需翻译');
      return undefined;
    }

    // 显示统计信息
    const message = `
📊 差异分析：
  ✅ 未变更：    ${stats.unchanged} 个
  ➕ 新增：      ${stats.added} 个
  ✏️  可能修改：  ${stats.modified} 个
  🗑️ 待删除：    ${stats.removed} 个
    `.trim();

    // 让用户选择模式
    const items = [
      {
        label: '🚀 智能同步（推荐）',
        description: `翻译新增+修改，删除多余 (${stats.added + stats.modified} 个)`,
        value: SyncMode.Smart,
        picked: true
      },
      {
        label: '➕ 仅翻译新增',
        description: `只处理新增的 ${stats.added} 个`,
        value: SyncMode.Incremental
      },
      {
        label: '✏️  全部重新翻译',
        description: `翻译所有 ${stats.total} 个 key`,
        value: SyncMode.Full
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: '请选择处理方式',
      title: message
    });

    return selected?.value as SyncMode;
  }

  /**
   * 执行翻译
   */
  private async performTranslation(
    baseFile: string,
    targetDir: string,
    targetLangs: string[]
  ): Promise<void> {
    try {
      // 读取基础文件
      const baseContent = fs.readFileSync(baseFile, 'utf-8');
      const baseData = yaml.load(baseContent) as YamlData;

      // 初始化 AI Provider
      const aiConfig = this.configManager.getAIConfig();
      const provider = createAIProvider(aiConfig) as AIProvider;

      const results: string[] = [];

      for (const lang of targetLangs) {
        const targetFile = path.join(targetDir, `${lang}.yaml`);

        // 读取或创建目标数据
        let targetData: YamlData = {};
        if (fs.existsSync(targetFile)) {
          const targetContent = fs.readFileSync(targetFile, 'utf-8');
          targetData = (yaml.load(targetContent) as YamlData) ?? {};
        }

        // 分析差异
        const diff = this.analyzeDiff(baseData, targetData);

        // 选择同步模式
        const mode = await this.selectSyncMode(diff);
        if (!mode) {
          continue;
        } // 用户取消或无需翻译

        // 执行同步
        await this.syncWithProgress(baseData, targetData, diff, mode, lang, provider, targetFile);

        results.push(`${lang}.yaml`);
      }

      if (results.length > 0) {
        void vscode.window
          .showInformationMessage(`✅ 翻译完成！已更新 ${results.length} 个文件`, '查看文件')
          .then(action => {
            if (action === '查看文件') {
              void vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(targetDir));
            }
          });
      }
    } catch (error) {
      Logger.error('翻译失败', error as Error);
      void vscode.window.showErrorMessage(`翻译失败: ${(error as Error).message}`);
    }
  }

  /**
   * 带进度显示的同步
   */
  private async syncWithProgress(
    baseData: YamlData,
    targetData: YamlData,
    diff: DiffResult,
    mode: SyncMode,
    targetLang: string,
    provider: AIProvider,
    targetFile: string
  ): Promise<void> {
    // 确定需要处理的 keys
    let keysToProcess: string[] = [];
    let keysToRemove: string[] = [];

    switch (mode) {
      case SyncMode.Smart:
        keysToProcess = [...diff.added, ...diff.modified];
        keysToRemove = diff.removed;
        break;
      case SyncMode.Incremental:
        keysToProcess = diff.added;
        keysToRemove = [];
        break;
      case SyncMode.Full:
        keysToProcess = this.extractAllKeys(baseData);
        keysToRemove = [];
        break;
    }

    if (keysToProcess.length === 0 && keysToRemove.length === 0) {
      return;
    }

    const totalTasks = keysToProcess.length + keysToRemove.length;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `🌐 正在翻译 ${targetLang}...`,
        cancellable: true
      },
      async (progress, token) => {
        let completed = 0;
        const result: YamlData = { ...targetData };

        // 分批处理，每批 10 个
        const batchSize = 10;
        const batches = this.chunkArray(keysToProcess, batchSize);

        for (const batch of batches) {
          if (token.isCancellationRequested) {
            void vscode.window.showInformationMessage('翻译已取消');
            return;
          }

          // 并行翻译一批
          await Promise.all(
            batch.map(async key => {
              const sourceValue = this.getValueByPath(baseData, key);
              if (sourceValue && typeof sourceValue === 'string') {
                try {
                  const translated = await provider.translate(sourceValue, {
                    to: targetLang,
                    context: `Key: ${key}`
                  });
                  this.setValueByPath(result, key, translated);
                } catch (err) {
                  Logger.error(`翻译失败 [${key}]: ${sourceValue}`, err as Error);
                  // 失败时保留原值或空值
                }
              }
              completed++;
            })
          );

          // 更新进度
          const percent = Math.round((completed / totalTasks) * 100);
          progress.report({
            increment: (batch.length / totalTasks) * 100,
            message: `${percent}% (${completed}/${totalTasks})`
          });
        }

        // 删除多余的 key
        for (const key of keysToRemove) {
          if (token.isCancellationRequested) {
            break;
          }
          this.deleteKeyByPath(result, key);
          completed++;
          progress.report({
            increment: (1 / totalTasks) * 100,
            message: `清理多余 key... (${completed}/${totalTasks})`
          });
        }

        // 保存文件
        fs.writeFileSync(targetFile, yaml.dump(result, { indent: 2 }), 'utf-8');
        Logger.info(`已保存: ${targetFile}`);
      }
    );
  }

  /**
   * 数组分批
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 提取所有 key（扁平化）
   */
  private extractAllKeys(obj: YamlValue, prefix = ''): string[] {
    const keys: string[] = [];

    if (typeof obj !== 'object' || obj === null) {
      return keys;
    }

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  private getValueByPath(obj: YamlValue, pathStr: string): YamlValue | undefined {
    const keys = pathStr.split('.');
    let current: YamlValue = obj;

    for (const key of keys) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as YamlData)[key];
    }

    return current;
  }

  private setValueByPath(obj: YamlData, pathStr: string, value: YamlValue): void {
    const keys = pathStr.split('.');
    let current: YamlData = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as YamlData;
    }

    current[keys[keys.length - 1]] = value;
  }

  private deleteKeyByPath(obj: YamlData, pathStr: string): void {
    const keys = pathStr.split('.');
    let current: YamlData = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        return;
      }
      current = current[key] as YamlData;
    }

    delete current[keys[keys.length - 1]];
  }
}
