// 📝 Markdown 翻译命令

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { ConfigManager } from '../utils/config';
import { createAIProvider } from '../utils/aiProvider';
import { Logger } from '../utils/logger';

// Frontmatter 数据接口
interface FrontmatterData {
  title?: string;
  description?: string;
  summary?: string;
  excerpt?: string;
  date?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  draft?: boolean;
  slug?: string;
  [key: string]: unknown;
}

// gray-matter 返回结果接口
interface MatterResult {
  data: FrontmatterData;
  content: string;
}

// AI Provider 接口
interface AIProvider {
  translate(text: string, options: { to: string; context?: string }): Promise<string>;
}

export class MarkdownTranslateCommand {
  private protectedBlocks: Map<string, string> = new Map();
  private blockCounter = 0;

  constructor(private configManager: ConfigManager) {}

  /**
   * 执行完整的 Markdown 翻译流程
   */
  async execute(): Promise<void> {
    if (!this.configManager.isAIConfigValid()) {
      void this.configManager.showConfigMissingPrompt();
      return;
    }

    // 选择源文件
    const sourceFile = await this.selectSourceFile();
    if (!sourceFile) {
      return;
    }

    // 选择目标语言
    const targetLang = await this.selectTargetLang();
    if (!targetLang) {
      return;
    }

    // 执行翻译
    await this.performTranslation(sourceFile, targetLang);
  }

  /**
   * 快速翻译（右键菜单）
   */
  async executeQuick(uri?: vscode.Uri): Promise<void> {
    if (!uri) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        uri = editor.document.uri;
      } else {
        void vscode.window.showErrorMessage('请先打开一个 Markdown 文件');
        return;
      }
    }

    if (!this.configManager.isAIConfigValid()) {
      void this.configManager.showConfigMissingPrompt();
      return;
    }

    // 快速选择语言
    const targetLang = await vscode.window.showQuickPick(
      [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
        { label: '日本語', value: 'ja-JP' },
        { label: '한국어', value: 'ko-KR' }
      ],
      {
        placeHolder: '选择目标语言'
      }
    );

    if (!targetLang) {
      return;
    }

    await this.performTranslation(uri.fsPath, targetLang.value);
  }

  private async selectSourceFile(): Promise<string | undefined> {
    const files = await vscode.workspace.findFiles('**/*.md', '**/node_modules/**');

    if (files.length === 0) {
      void vscode.window.showErrorMessage('未找到 Markdown 文件');
      return;
    }

    const items = files.map(f => ({
      label: path.basename(f.fsPath),
      description: vscode.workspace.asRelativePath(f),
      detail: f.fsPath,
      path: f.fsPath
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: '选择要翻译的 Markdown 文件',
      title: '📝 Markdown 翻译'
    });

    return selected?.path;
  }

  private async selectTargetLang(): Promise<string | undefined> {
    const selected = await vscode.window.showQuickPick(
      [
        { label: '简体中文', value: 'zh-CN' },
        { label: '繁体中文', value: 'zh-TW' },
        { label: 'English', value: 'en-US' },
        { label: '日本語', value: 'ja-JP' },
        { label: '한국어', value: 'ko-KR' },
        { label: 'Français', value: 'fr-FR' },
        { label: 'Deutsch', value: 'de-DE' },
        { label: 'Español', value: 'es-ES' }
      ],
      {
        placeHolder: '选择目标语言'
      }
    );

    return selected?.value;
  }

  private async performTranslation(sourceFile: string, targetLang: string): Promise<void> {
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: '📝 正在翻译 Markdown...',
      cancellable: true
    };

    await vscode.window.withProgress(progressOptions, async (progress, token) => {
      try {
        // 读取文件
        const content = fs.readFileSync(sourceFile, 'utf-8');

        // 解析 frontmatter
        const parsed = matter(content) as MatterResult;
        const frontmatter = parsed.data;
        let body = parsed.content;

        progress.report({ increment: 10, message: '正在保护特殊内容...' });

        // 保护特殊内容
        body = this.protectCodeBlocks(body);
        body = this.protectInlineCode(body);
        body = this.protectLinks(body);
        body = this.protectImages(body);
        body = this.protectHtmlTags(body);

        progress.report({ increment: 20, message: '正在翻译...' });

        // 初始化 AI Provider
        const aiConfig = this.configManager.getAIConfig();
        const provider = createAIProvider(aiConfig);

        // 翻译正文
        const translatedBody = await this.translateBody(body, targetLang, provider, token);

        progress.report({ increment: 50, message: '正在恢复特殊内容...' });

        // 恢复保护的内容
        const finalBody = this.restoreProtectedBlocks(translatedBody);

        // 翻译 frontmatter
        const translatedFrontmatter = await this.translateFrontmatter(
          frontmatter,
          targetLang,
          provider
        );

        // 重组文件
        const output = matter.stringify(finalBody, translatedFrontmatter);

        // 生成输出路径
        const dir = path.dirname(sourceFile);
        const base = path.basename(sourceFile, '.md');
        const outputFile = path.join(dir, `${base}.${targetLang}.md`);

        progress.report({ increment: 15, message: '正在保存...' });

        // 保存文件
        fs.writeFileSync(outputFile, output, 'utf-8');

        progress.report({ increment: 5, message: '完成！' });

        // 打开文件
        const document = await vscode.workspace.openTextDocument(outputFile);
        await vscode.window.showTextDocument(document);

        void vscode.window.showInformationMessage(
          `✅ 翻译完成！已保存到 ${path.basename(outputFile)}`
        );

        Logger.info(`Markdown 翻译完成: ${outputFile}`);
      } catch (error) {
        Logger.error('Markdown 翻译失败', error as Error);
        void vscode.window.showErrorMessage(`翻译失败: ${(error as Error).message}`);
      }
    });
  }

  private protectCodeBlocks(content: string): string {
    const codeBlockRegex = /```[\s\S]*?```/g;
    return content.replace(codeBlockRegex, match => {
      return this.protectBlock(match, 'codeblock');
    });
  }

  private protectInlineCode(content: string): string {
    const inlineCodeRegex = /`[^`]+`/g;
    return content.replace(inlineCodeRegex, match => {
      return this.protectBlock(match, 'inlinecode');
    });
  }

  private protectLinks(content: string): string {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return content.replace(linkRegex, (_match, text, url) => {
      const protectedUrl = this.protectBlock(`(${url})`, 'link');
      return `[${text}]${protectedUrl}`;
    });
  }

  private protectImages(content: string): string {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    return content.replace(imageRegex, match => {
      return this.protectBlock(match, 'image');
    });
  }

  private protectHtmlTags(content: string): string {
    const htmlRegex = /<[^>]+>/g;
    return content.replace(htmlRegex, match => {
      return this.protectBlock(match, 'html');
    });
  }

  private protectBlock(content: string, type: string): string {
    const placeholder = `{{${type.toUpperCase()}_${this.blockCounter++}}}`;
    this.protectedBlocks.set(placeholder, content);
    return placeholder;
  }

  private restoreProtectedBlocks(content: string): string {
    let result = content;
    for (const [placeholder, original] of this.protectedBlocks) {
      result = result.replace(placeholder, original);
    }
    this.protectedBlocks.clear();
    this.blockCounter = 0;
    return result;
  }

  private async translateBody(
    content: string,
    targetLang: string,
    provider: AIProvider,
    token: vscode.CancellationToken
  ): Promise<string> {
    const paragraphs = content.split('\n\n');
    const translatedParagraphs: string[] = [];

    for (const paragraph of paragraphs) {
      if (token.isCancellationRequested) {
        break;
      }

      if (this.shouldSkipTranslation(paragraph)) {
        translatedParagraphs.push(paragraph);
      } else {
        const translated = await this.translateParagraph(paragraph, targetLang, provider);
        translatedParagraphs.push(translated);
      }
    }

    return translatedParagraphs.join('\n\n');
  }

  private shouldSkipTranslation(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) {
      return true;
    }
    if (/^\{\{[A-Z_]+_\d+\}\}$/.test(trimmed)) {
      return true;
    }
    return false;
  }

  private async translateParagraph(
    paragraph: string,
    targetLang: string,
    provider: AIProvider
  ): Promise<string> {
    // 处理标题
    const headerMatch = paragraph.match(/^(#{1,6}\s+)(.+)$/);
    if (headerMatch) {
      const prefix = headerMatch[1];
      const title = headerMatch[2];
      const translatedTitle = await provider.translate(title, {
        to: targetLang,
        context: '这是 Markdown 文档的标题'
      });
      return `${prefix}${translatedTitle}`;
    }

    // 普通段落
    const translated = await provider.translate(paragraph, {
      to: targetLang,
      context: '这是 Markdown 文档的正文内容，保持 Markdown 格式'
    });

    return translated;
  }

  private async translateFrontmatter(
    frontmatter: FrontmatterData,
    targetLang: string,
    provider: AIProvider
  ): Promise<FrontmatterData> {
    const fieldsToTranslate = ['title', 'description', 'summary', 'excerpt'];
    const result: FrontmatterData = { ...frontmatter };

    for (const field of fieldsToTranslate) {
      const value = result[field];
      if (typeof value === 'string') {
        result[field] = await provider.translate(value, {
          to: targetLang,
          context: '这是文档的元数据字段'
        });
      }
    }

    return result;
  }
}
