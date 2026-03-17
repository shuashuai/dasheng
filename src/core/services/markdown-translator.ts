// 📝 七十二变·译真经 - Markdown 翻译服务

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, basename, extname, join } from 'path';
import chalk from 'chalk';
import matter from 'gray-matter';
import type { AIProvider } from '../providers/ai-provider.js';
import { createAIProvider, MockProvider } from '../providers/ai-provider.js';

export interface MarkdownTranslateResult {
  sourceFile: string;
  outputFile: string;
  targetLang: string;
  charsTranslated: number;
  codeBlocksProtected: number;
  linksProtected: number;
}

/**
 * Markdown 翻译器
 * 保护 frontmatter、代码块、链接等不被翻译
 */
export class MarkdownTranslator {
  private aiProvider: AIProvider;
  private protectedBlocks: Map<string, string> = new Map();
  private blockCounter = 0;

  constructor(config: {
    provider: 'openai' | 'anthropic' | 'local';
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    mock?: boolean;
  }) {
    if (config.mock || !config.apiKey) {
      this.aiProvider = new MockProvider();
    } else {
      this.aiProvider = createAIProvider(config);
    }
  }

  /**
   * 翻译 Markdown 文件
   */
  async translate(
    filePath: string,
    targetLang: string = 'zh-CN',
    outputPath?: string,
    keepFrontmatter: boolean = true
  ): Promise<MarkdownTranslateResult> {
    // 1. 读取文件
    if (!existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    
    // 2. 解析 frontmatter
    const parsed = matter(content);
    const frontmatter = parsed.data;
    let body = parsed.content;

    // 3. 保护特殊内容
    body = this.protectCodeBlocks(body);
    body = this.protectInlineCode(body);
    body = this.protectLinks(body);
    body = this.protectImages(body);
    body = this.protectHtmlTags(body);

    // 记录保护块数量（在恢复前）
    const codeBlocksCount = this.getProtectedCount('codeblock') + this.getProtectedCount('inlinecode');
    const linksCount = this.getProtectedCount('link') + this.getProtectedCount('image');

    // 4. 翻译正文
    const translatedBody = await this.translateBody(body, targetLang);

    // 5. 恢复保护的内容
    const finalBody = this.restoreProtectedBlocks(translatedBody);

    // 6. 重组文件
    let output: string;
    if (keepFrontmatter && Object.keys(frontmatter).length > 0) {
      // 翻译 frontmatter 中的特定字段（如 title, description）
      const translatedFrontmatter = await this.translateFrontmatter(frontmatter, targetLang);
      output = matter.stringify(finalBody, translatedFrontmatter);
    } else {
      output = finalBody;
    }

    // 7. 确定输出路径
    const finalOutputPath = outputPath || this.generateOutputPath(filePath, targetLang);

    // 8. 写入文件
    writeFileSync(finalOutputPath, output, 'utf-8');

    return {
      sourceFile: filePath,
      outputFile: finalOutputPath,
      targetLang,
      charsTranslated: body.length,
      codeBlocksProtected: codeBlocksCount,
      linksProtected: linksCount
    };
  }

  /**
   * 保护代码块
   */
  private protectCodeBlocks(content: string): string {
    // 匹配 ```...``` 格式的代码块
    const codeBlockRegex = /```[\s\S]*?```/g;
    return content.replace(codeBlockRegex, (match) => {
      return this.protectBlock(match, 'codeblock');
    });
  }

  /**
   * 保护行内代码
   */
  private protectInlineCode(content: string): string {
    // 匹配 `...` 格式的行内代码
    const inlineCodeRegex = /`[^`]+`/g;
    return content.replace(inlineCodeRegex, (match) => {
      return this.protectBlock(match, 'inlinecode');
    });
  }

  /**
   * 保护链接
   */
  private protectLinks(content: string): string {
    // 匹配 [text](url) 格式的链接
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return content.replace(linkRegex, (_match, text, url) => {
      // 只保护 URL，文本部分可以翻译
      const protectedUrl = this.protectBlock(`(${url})`, 'link');
      return `[${text}]${protectedUrl}`;
    });
  }

  /**
   * 保护图片
   */
  private protectImages(content: string): string {
    // 匹配 ![alt](url) 格式的图片
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    return content.replace(imageRegex, (match, _alt, _url) => {
      // 保护整个图片语法
      return this.protectBlock(match, 'image');
    });
  }

  /**
   * 保护 HTML 标签
   */
  private protectHtmlTags(content: string): string {
    // 匹配 HTML 标签
    const htmlRegex = /<[^>]+>/g;
    return content.replace(htmlRegex, (match) => {
      return this.protectBlock(match, 'html');
    });
  }

  /**
   * 保护块内容，返回占位符
   */
  private protectBlock(content: string, type: string): string {
    const placeholder = `{{${type.toUpperCase()}_${this.blockCounter++}}}`;
    this.protectedBlocks.set(placeholder, content);
    return placeholder;
  }

  /**
   * 获取保护块数量
   */
  private getProtectedCount(type: string): number {
    let count = 0;
    for (const key of this.protectedBlocks.keys()) {
      if (key.includes(type.toUpperCase())) {
        count++;
      }
    }
    return count;
  }

  /**
   * 恢复保护的内容
   */
  private restoreProtectedBlocks(content: string): string {
    let result = content;
    for (const [placeholder, original] of this.protectedBlocks) {
      result = result.replace(placeholder, original);
    }
    // 清理
    this.protectedBlocks.clear();
    this.blockCounter = 0;
    return result;
  }

  /**
   * 翻译正文内容
   * 将内容分段，逐段翻译
   */
  private async translateBody(content: string, targetLang: string): Promise<string> {
    // 按段落分割
    const paragraphs = content.split('\n\n');
    const translatedParagraphs: string[] = [];

    for (const paragraph of paragraphs) {
      if (this.shouldSkipTranslation(paragraph)) {
        // 跳过不需要翻译的内容（如全是占位符、空行等）
        translatedParagraphs.push(paragraph);
      } else {
        const translated = await this.translateParagraph(paragraph, targetLang);
        translatedParagraphs.push(translated);
      }
    }

    return translatedParagraphs.join('\n\n');
  }

  /**
   * 判断是否跳过翻译
   */
  private shouldSkipTranslation(text: string): boolean {
    const trimmed = text.trim();
    // 空行
    if (!trimmed) return true;
    // 全是占位符
    if (/^\{\{[A-Z_]+_\d+\}\}$/.test(trimmed)) return true;
    // 标题标记行（如 ## Title）
    if (/^#{1,6}\s+/.test(trimmed) && !trimmed.slice(trimmed.indexOf(' ')).trim().match(/[a-zA-Z]/)) return false;
    return false;
  }

  /**
   * 翻译单个段落
   */
  private async translateParagraph(paragraph: string, targetLang: string): Promise<string> {
    try {
      // 如果是标题，提取标题内容翻译
      const headerMatch = paragraph.match(/^(#{1,6}\s+)(.+)$/);
      if (headerMatch) {
        const prefix = headerMatch[1];
        const title = headerMatch[2];
        const translatedTitle = await this.aiProvider.translate(title, {
          to: targetLang,
          context: '这是 Markdown 文档的标题'
        });
        return `${prefix}${translatedTitle}`;
      }

      // 普通段落翻译
      const translated = await this.aiProvider.translate(paragraph, {
        to: targetLang,
        context: '这是 Markdown 文档的正文内容，保持 Markdown 格式'
      });

      return translated;
    } catch (error) {
      console.error(chalk.red(`翻译段落失败: ${paragraph.slice(0, 50)}...`), error);
      return paragraph;
    }
  }

  /**
   * 翻译 frontmatter 中的特定字段
   */
  private async translateFrontmatter(
    frontmatter: Record<string, any>,
    targetLang: string
  ): Promise<Record<string, any>> {
    const fieldsToTranslate = ['title', 'description', 'summary', 'author'];
    const result = { ...frontmatter };

    for (const field of fieldsToTranslate) {
      if (typeof result[field] === 'string') {
        try {
          result[field] = await this.aiProvider.translate(result[field], {
            to: targetLang,
            context: '这是文档的元数据字段'
          });
        } catch (error) {
          console.error(chalk.red(`翻译 frontmatter.${field} 失败`), error);
        }
      }
    }

    return result;
  }

  /**
   * 生成输出文件路径
   */
  private generateOutputPath(filePath: string, targetLang: string): string {
    const dir = dirname(filePath);
    const base = basename(filePath, extname(filePath));
    const ext = extname(filePath);
    return join(dir, `${base}.${targetLang}${ext}`);
  }
}
