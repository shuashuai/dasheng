// 🎨 封面生成命令

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

// Frontmatter 接口定义
interface FrontmatterData {
  title?: string;
  excerpt?: string;
  description?: string;
  author?: string;
  date?: string;
}

interface FrontmatterResult {
  data: FrontmatterData;
  content: string;
}

// 样式颜色接口定义
interface StyleColors {
  bgStart: string;
  bgEnd: string;
  accent: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  grid: string;
}

export class CoverGenerateCommand {
  constructor(private configManager: ConfigManager) {}

  /**
   * 执行封面生成流程
   */
  async execute(): Promise<void> {
    // 选择或输入主题
    const topic = await this.inputTopic();
    if (!topic) {
      return;
    }

    // 选择风格
    const style = await this.selectStyle();
    if (!style) {
      return;
    }

    // 选择比例
    const ratio = await this.selectRatio();
    if (!ratio) {
      return;
    }

    // 选择输出位置
    const outputPath = await this.selectOutputPath();
    if (!outputPath) {
      return;
    }

    // 生成封面
    await this.generateCover({ topic, style, ratio, outputPath });
  }

  /**
   * 为当前文件生成封面
   */
  async executeForFile(uri?: vscode.Uri): Promise<void> {
    if (!uri) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        uri = editor.document.uri;
      } else {
        void vscode.window.showErrorMessage('请先打开一个 Markdown 文件');
        return;
      }
    }

    // 从文件提取信息
    const info = this.extractFromMarkdown(uri.fsPath);

    // 选择风格
    const style = await this.selectStyle();
    if (!style) {
      return;
    }

    // 选择比例
    const ratio = await this.selectRatio();
    if (!ratio) {
      return;
    }

    // 生成输出路径
    const dir = path.dirname(uri.fsPath);
    const base = path.basename(uri.fsPath, '.md');
    const outputPath = path.join(dir, `${base}-cover.png`);

    // 生成封面
    await this.generateCover({
      topic: info.title,
      subtitle: info.subtitle,
      author: info.author,
      style,
      ratio,
      outputPath
    });
  }

  private async inputTopic(): Promise<string | undefined> {
    const topic = await vscode.window.showInputBox({
      prompt: '输入封面主题',
      placeHolder: '例如：VS Code 插件开发指南',
      title: '🎨 封面生成'
    });

    return topic;
  }

  private async selectStyle(): Promise<string | undefined> {
    const config = this.configManager.getCoverConfig();

    const selected = await vscode.window.showQuickPick(
      [
        {
          label: '$(rocket) 科技风',
          description: '深蓝紫渐变，现代感强',
          value: 'tech',
          picked: config.defaultStyle === 'tech'
        },
        {
          label: '$(circle-outline) 简约风',
          description: '极简纯色，优雅干净',
          value: 'minimal',
          picked: config.defaultStyle === 'minimal'
        },
        {
          label: '$(color-mode) 渐变风',
          description: '多彩流体，活泼鲜艳',
          value: 'gradient',
          picked: config.defaultStyle === 'gradient'
        },
        {
          label: '$(paintbrush) 插画风',
          description: '手绘温暖，亲切有趣',
          value: 'illustration',
          picked: config.defaultStyle === 'illustration'
        },
        {
          label: '$(briefcase) 商务风',
          description: '深色专业，正式商务',
          value: 'business',
          picked: config.defaultStyle === 'business'
        }
      ],
      {
        placeHolder: '选择封面风格',
        title: '🎨 封面风格'
      }
    );

    return selected?.value;
  }

  private async selectRatio(): Promise<string | undefined> {
    const config = this.configManager.getCoverConfig();

    const selected = await vscode.window.showQuickPick(
      [
        {
          label: '16:9',
          description: '宽屏，适合博客头图、YouTube',
          value: '16:9',
          picked: config.defaultRatio === '16:9'
        },
        {
          label: '1:1',
          description: '正方形，适合社交媒体',
          value: '1:1',
          picked: config.defaultRatio === '1:1'
        },
        {
          label: '9:16',
          description: '竖屏，适合手机端',
          value: '9:16',
          picked: config.defaultRatio === '9:16'
        },
        {
          label: '4:3',
          description: '标准比例，适合文档',
          value: '4:3',
          picked: config.defaultRatio === '4:3'
        },
        {
          label: '21:9',
          description: '超宽屏，适合 Banner',
          value: '21:9',
          picked: config.defaultRatio === '21:9'
        }
      ],
      {
        placeHolder: '选择封面比例',
        title: '🎨 封面比例'
      }
    );

    return selected?.value;
  }

  private async selectOutputPath(): Promise<string | undefined> {
    const result = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file('cover.png'),
      filters: {
        'PNG 图片': ['png']
      },
      title: '保存封面图片',
      saveLabel: '保存封面'
    });

    return result?.fsPath;
  }

  private extractFromMarkdown(filePath: string): {
    title: string;
    subtitle?: string;
    author?: string;
    date?: string;
  } {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(content) as FrontmatterResult;

    return {
      title: parsed.data.title || this.extractFirstLine(parsed.content) || '未命名',
      subtitle: parsed.data.excerpt || parsed.data.description,
      author: parsed.data.author,
      date: parsed.data.date
    };
  }

  private extractFirstLine(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed.replace(/^#+\s*/, '').slice(0, 50);
      }
    }
    return '';
  }

  private async generateCover(options: {
    topic: string;
    subtitle?: string;
    author?: string;
    style: string;
    ratio: string;
    outputPath: string;
  }): Promise<void> {
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: '🎨 正在生成封面...',
      cancellable: false
    };

    await vscode.window.withProgress(progressOptions, async progress => {
      try {
        progress.report({ increment: 20, message: '准备生成...' });

        // 由于 VS Code 扩展中无法直接使用 Node Canvas
        // 这里我们生成一个 SVG 封面，或者调用外部服务
        // 实际项目中可以集成图片生成服务或使用纯 SVG

        const svgContent = this.generateSVG(options);

        progress.report({ increment: 50, message: '渲染封面...' });

        // 保存 SVG（实际使用时可以转换为 PNG）
        const svgPath = options.outputPath.replace('.png', '.svg');
        fs.writeFileSync(svgPath, svgContent, 'utf-8');

        progress.report({ increment: 30, message: '完成！' });

        // 显示结果
        const result = await vscode.window.showInformationMessage(
          `✅ 封面已生成！（SVG 格式）`,
          '打开文件',
          '查看目录'
        );

        if (result === '打开文件') {
          const doc = await vscode.workspace.openTextDocument(svgPath);
          await vscode.window.showTextDocument(doc);
        } else if (result === '查看目录') {
          void vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(svgPath));
        }

        Logger.info(`封面已生成: ${svgPath}`);

        // 显示提示：如何转换为 PNG
        void vscode.window
          .showInformationMessage('提示：SVG 封面可以使用浏览器或其他工具转换为 PNG', '了解更多')
          .then(action => {
            if (action === '了解更多') {
              void vscode.env.openExternal(
                vscode.Uri.parse('https://github.com/shuashuai/dasheng')
              );
            }
          });
      } catch (error) {
        Logger.error('封面生成失败', error as Error);
        void vscode.window.showErrorMessage(`生成失败: ${(error as Error).message}`);
      }
    });
  }

  private generateSVG(options: {
    topic: string;
    subtitle?: string;
    author?: string;
    style: string;
    ratio: string;
  }): string {
    const dimensions = this.parseRatio(options.ratio);
    const colors = this.getStyleColors(options.style);

    const width = dimensions.width;
    const height = dimensions.height;

    // 处理标题换行
    const titleLines = this.wrapText(options.topic, Math.floor((width * 0.8) / (width * 0.045)));
    const lineHeight = width * 0.06;
    const startY = height * 0.5 - ((titleLines.length - 1) * lineHeight) / 2;

    // 生成标题文本元素
    const titleSvg = titleLines
      .map((line, index) => {
        const y = startY + index * lineHeight;
        // 限制最多3行，超过显示省略号
        if (index >= 3) {
          return '';
        }
        const displayLine = index === 2 && titleLines.length > 3 ? line.slice(0, -1) + '...' : line;
        return `  <text x="50%" y="${y}" 
        font-family="Arial, sans-serif" font-size="${width * 0.045}" 
        font-weight="bold" fill="${colors.text}" text-anchor="middle">
    ${this.escapeXml(displayLine)}
  </text>`;
      })
      .filter(line => line !== '')
      .join('\n');

    // 生成作者文本（如果有）
    const authorSvg = options.author
      ? `  <text x="50%" y="${height * 0.75}" 
        font-family="Arial, sans-serif" font-size="${width * 0.02}" 
        fill="${colors.textMuted}" text-anchor="middle" opacity="0.8">
    ${this.escapeXml(options.author)}
  </text>`
      : '';

    // 生成 SVG
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bgStart}" />
      <stop offset="100%" style="stop-color:${colors.bgEnd}" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="100%" height="100%" fill="url(#bg)" />
  
  <!-- 装饰元素 -->
  <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.1}" 
          fill="${colors.accent}" opacity="0.15" />
  <circle cx="${width * 0.1}" cy="${height * 0.85}" r="${width * 0.15}" 
          fill="${colors.accent}" opacity="0.1" />
  <circle cx="${width * 0.75}" cy="${height * 0.8}" r="${width * 0.08}" 
          fill="${colors.accent}" opacity="0.1" />
  
  <!-- 标题（支持自动换行，最多3行） -->
${titleSvg}
  
${authorSvg}
  
  <!-- 底部装饰条 -->
  <rect x="0" y="${height - 8}" width="100%" height="8" fill="${colors.accent}" opacity="0.8" />
</svg>`;
  }

  /**
   * 文本换行处理
   */
  private wrapText(text: string, maxCharsPerLine: number): string[] {
    if (text.length <= maxCharsPerLine) {
      return [text];
    }

    const lines: string[] = [];
    let currentLine = '';

    // 按字符分割（支持中英文混合）
    const chars = text.split('');

    for (const char of chars) {
      // 中文字符算2个宽度，英文算1个
      const charWidth = char.charCodeAt(0) > 127 ? 2 : 1;
      const currentWidth = currentLine
        .split('')
        .reduce((sum, c) => sum + (c.charCodeAt(0) > 127 ? 2 : 1), 0);

      if (currentWidth + charWidth > maxCharsPerLine * 2) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine += char;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private parseRatio(ratio: string): { width: number; height: number } {
    const ratios: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '1:1': { width: 1200, height: 1200 },
      '9:16': { width: 1080, height: 1920 },
      '4:3': { width: 1600, height: 1200 },
      '21:9': { width: 2560, height: 1080 }
    };
    return ratios[ratio] || ratios['16:9'];
  }

  private getStyleColors(style: string): StyleColors {
    const styles: Record<string, StyleColors> = {
      tech: {
        bgStart: '#0a0f1c',
        bgEnd: '#2d1b69',
        accent: '#6366f1',
        cardBg: '#0f172a',
        text: '#ffffff',
        textSecondary: '#a5b4fc',
        textMuted: '#818cf8',
        grid: '#6366f1'
      },
      minimal: {
        bgStart: '#fafaf9',
        bgEnd: '#e7e5e4',
        accent: '#78716c',
        cardBg: '#ffffff',
        text: '#1c1917',
        textSecondary: '#78716c',
        textMuted: '#a8a29e',
        grid: '#d6d3d1'
      },
      gradient: {
        bgStart: '#ff6b6b',
        bgEnd: '#4ecdc4',
        accent: '#ffe66d',
        cardBg: '#ffffff',
        text: '#2d3436',
        textSecondary: '#636e72',
        textMuted: '#b2bec3',
        grid: '#ffffff'
      },
      illustration: {
        bgStart: '#fef3c7',
        bgEnd: '#fde68a',
        accent: '#f59e0b',
        cardBg: '#ffffff',
        text: '#1f2937',
        textSecondary: '#4b5563',
        textMuted: '#9ca3af',
        grid: '#fbbf24'
      },
      business: {
        bgStart: '#0c0a09',
        bgEnd: '#1c1917',
        accent: '#fbbf24',
        cardBg: '#1c1917',
        text: '#fbbf24',
        textSecondary: '#a8a29e',
        textMuted: '#57534e',
        grid: '#44403c'
      }
    };

    return styles[style] ?? styles.tech;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
