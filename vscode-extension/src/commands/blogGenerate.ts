// ✍️ 博客生成命令

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigManager } from '../utils/config';
import { createAIProvider } from '../utils/aiProvider';
import { Logger } from '../utils/logger';

export class BlogGenerateCommand {
  constructor(private configManager: ConfigManager) {}

  /**
   * 执行博客生成流程
   */
  async execute(): Promise<void> {
    if (!this.configManager.isAIConfigValid()) {
      await this.configManager.showConfigMissingPrompt();
      return;
    }

    // 选择输入方式
    const inputMethod = await vscode.window.showQuickPick(
      [
        { label: '$(file-text) 从 Release Notes 文件', value: 'file' },
        { label: '$(edit) 手动输入主题', value: 'manual' },
        { label: '$(git-branch) 从 Git 日志', value: 'git' }
      ],
      {
        placeHolder: '选择博客内容来源',
        title: '✍️ 博客生成'
      }
    );

    if (!inputMethod) {
      return;
    }

    let input: { topic?: string; keyPoints?: string[]; rawContent?: string } = {};

    if (inputMethod.value === 'file') {
      const content = await this.selectReleaseNotesFile();
      if (!content) {
        return;
      }
      input.rawContent = content;
    } else if (inputMethod.value === 'manual') {
      const manualInput = await this.manualInput();
      if (!manualInput) {
        return;
      }
      input = manualInput;
    } else if (inputMethod.value === 'git') {
      const gitContent = await this.getGitLogs();
      if (!gitContent) {
        return;
      }
      input.rawContent = gitContent;
    }

    // 选择风格
    const style = await this.selectStyle();
    if (!style) {
      return;
    }

    // 执行生成
    await this.generateBlog(input, style);
  }

  private async selectReleaseNotesFile(): Promise<string | undefined> {
    const files = await vscode.workspace.findFiles(
      '**/{CHANGELOG,RELEASE,CHANGES,HISTORY}*',
      '**/node_modules/**'
    );

    const items = files.map(f => ({
      label: path.basename(f.fsPath),
      description: vscode.workspace.asRelativePath(f),
      path: f.fsPath
    }));

    // 添加自定义文件选项
    items.unshift({
      label: '$(folder-opened) 选择其他文件...',
      description: '浏览文件系统',
      path: '__browse__'
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: '选择 Release Notes 文件',
      title: '✍️ 选择源文件'
    });

    if (!selected) {
      return;
    }

    let filePath = selected.path;
    if (filePath === '__browse__') {
      const result = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          文本文件: ['md', 'txt', 'rst'],
          所有文件: ['*']
        }
      });
      if (!result || result.length === 0) {
        return;
      }
      filePath = result[0].fsPath;
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  private async manualInput(): Promise<{ topic: string; keyPoints: string[] } | undefined> {
    const topic = await vscode.window.showInputBox({
      prompt: '输入博客主题',
      placeHolder: '例如：VS Code 插件开发入门',
      title: '✍️ 博客主题'
    });

    if (!topic) {
      return;
    }

    const points = await vscode.window.showInputBox({
      prompt: '输入关键要点（用逗号分隔）',
      placeHolder: '例如：环境搭建, 基础概念, 实战演练, 发布流程',
      title: '✍️ 关键要点'
    });

    return {
      topic,
      keyPoints: points ? points.split(',').map(p => p.trim()) : []
    };
  }

  private async getGitLogs(): Promise<string | undefined> {
    // 这里可以实现 Git 日志获取
    // 简化版本：提示用户使用终端命令
    const result = await vscode.window.showInformationMessage(
      '请使用终端运行 git log 命令，然后将输出复制到手动输入模式',
      '打开终端',
      '切换到手动输入'
    );

    if (result === '打开终端') {
      void vscode.commands.executeCommand('workbench.action.terminal.toggleTerminal');
    } else if (result === '切换到手动输入') {
      return this.manualInput().then(r =>
        r ? `${r.topic}\n\n${r.keyPoints?.map(p => `- ${p}`).join('\n')}` : undefined
      );
    }

    return;
  }

  private async selectStyle(): Promise<string | undefined> {
    const config = this.configManager.getBlogConfig();

    const selected = await vscode.window.showQuickPick(
      [
        {
          label: '$(versions) 版本发布',
          description: '适合发布新版本时使用的文章风格',
          value: 'release',
          picked: config.defaultStyle === 'release'
        },
        {
          label: '$(book) 教程指南',
          description: '循序渐进的教学式文章',
          value: 'tutorial',
          picked: config.defaultStyle === 'tutorial'
        },
        {
          label: '$(radio-tower) 新闻资讯',
          description: '客观简洁的新闻报道风格',
          value: 'news',
          picked: config.defaultStyle === 'news'
        },
        {
          label: '$(search) 深度分析',
          description: '深入探讨技术原理的长文',
          value: 'deep-dive',
          picked: config.defaultStyle === 'deep-dive'
        },
        {
          label: '$(heart) 故事叙述',
          description: '生动有温度的故事化表达',
          value: 'story',
          picked: config.defaultStyle === 'story'
        }
      ],
      {
        placeHolder: '选择博客风格',
        title: '✍️ 博客风格'
      }
    );

    return selected?.value;
  }

  private async generateBlog(
    input: { topic?: string; keyPoints?: string[]; rawContent?: string },
    style: string
  ): Promise<void> {
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: '✍️ 正在生成博客...',
      cancellable: true
    };

    await vscode.window.withProgress(progressOptions, async (progress, token) => {
      try {
        progress.report({ increment: 10, message: '准备生成...' });

        const aiConfig = this.configManager.getAIConfig();
        const provider = createAIProvider(aiConfig);

        progress.report({ increment: 20, message: '构建提示词...' });

        const prompt = this.buildPrompt(input, style);

        progress.report({ increment: 20, message: 'AI 生成中...' });

        const content = await provider.complete(prompt, {
          temperature: 0.7,
          maxTokens: 4000
        });

        if (token.isCancellationRequested) {
          return;
        }

        progress.report({ increment: 40, message: '处理结果...' });

        // 解析生成的内容
        const blog = this.parseGeneratedContent(content, style);

        // 生成输出路径
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const outputDir = workspaceFolder
          ? path.join(workspaceFolder.uri.fsPath, 'blog')
          : path.join(os.homedir(), 'dasheng-blog');

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const date = new Date().toISOString().split('T')[0];
        const slug = blog.title
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        const outputFile = path.join(outputDir, `${date}-${slug}.md`);

        // 添加 frontmatter
        const fullContent = `---
title: ${blog.title}
excerpt: ${blog.excerpt}
date: ${date}
tags: [${blog.tags.map(t => `"${t}"`).join(', ')}]
style: ${style}
---

${blog.content}`;

        fs.writeFileSync(outputFile, fullContent, 'utf-8');

        progress.report({ increment: 10, message: '完成！' });

        // 打开文件
        const document = await vscode.workspace.openTextDocument(outputFile);
        await vscode.window.showTextDocument(document);

        void vscode.window
          .showInformationMessage(`✅ 博客已生成！`, '生成封面', '发布到...')
          .then(action => {
            if (action === '生成封面') {
              void vscode.commands.executeCommand(
                'dasheng.generateCoverForFile',
                vscode.Uri.file(outputFile)
              );
            }
          });

        Logger.info(`博客已生成: ${outputFile}`);
      } catch (error) {
        Logger.error('博客生成失败', error as Error);
        void vscode.window.showErrorMessage(`生成失败: ${(error as Error).message}`);
      }
    });
  }

  private buildPrompt(
    input: { topic?: string; keyPoints?: string[]; rawContent?: string },
    style: string
  ): string {
    let contentPrompt = '';

    if (input.rawContent) {
      contentPrompt = `请根据以下 Release Notes 内容生成博客文章：\n\n${input.rawContent}`;
    } else {
      contentPrompt = `请根据以下主题生成博客文章：\n\n主题：${input.topic}`;
      if (input.keyPoints && input.keyPoints.length > 0) {
        contentPrompt += `\n\n关键要点：\n${input.keyPoints.map(p => `- ${p}`).join('\n')}`;
      }
    }

    const stylePrompt = this.getStylePrompt(style);

    return `${contentPrompt}\n\n${stylePrompt}\n\n请按照以下格式输出：

TITLE: [博客标题]
---
EXCERPT: [一句话摘要，50字以内]
---
TAGS: [标签1, 标签2, 标签3]
---
CONTENT:
[博客正文，使用 Markdown 格式]`;
  }

  private getStylePrompt(style: string): string {
    const prompts: Record<string, string> = {
      release: `风格要求：版本发布
- 标题要体现版本号和主要亮点
- 开头简述本次更新的核心价值
- 正文分章节介绍新特性、改进和修复
- 结尾包含升级指南和致谢
- 语气专业、清晰、令人兴奋`,

      tutorial: `风格要求：教程指南
- 标题要有"如何"、"入门"等教学词汇
- 假设读者是初学者，循序渐进
- 包含代码示例和步骤说明
- 提供实用的技巧和最佳实践
- 语气友好、耐心、实用`,

      news: `风格要求：新闻资讯
- 标题要吸引眼球，概括核心信息
- 倒金字塔结构：重要信息前置
- 客观陈述事实，引用数据和来源
- 包含背景和意义分析
- 语气客观、简洁、权威`,

      'deep-dive': `风格要求：深度分析
- 标题要有洞察力和思考深度
- 深入探讨技术原理和设计决策
- 包含架构图、流程图等概念性描述
- 对比分析不同方案的优劣
- 语气严谨、深入、有见地`,

      story: `风格要求：故事叙述
- 标题要有故事性和情感共鸣
- 以场景或问题引入
- 讲述解决问题的过程
- 包含人物视角和情感体验
- 语气生动、有温度、引人入胜`
    };

    return prompts[style] || prompts.release;
  }

  private parseGeneratedContent(
    content: string,
    _style: string
  ): {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
  } {
    const parts = content.split('---').map(p => p.trim());

    const result = {
      title: '',
      excerpt: '',
      content: content,
      tags: [] as string[]
    };

    for (const part of parts) {
      if (part.startsWith('TITLE:')) {
        result.title = part.replace('TITLE:', '').trim();
      } else if (part.startsWith('EXCERPT:')) {
        result.excerpt = part.replace('EXCERPT:', '').trim();
      } else if (part.startsWith('TAGS:')) {
        const tagsStr = part
          .replace('TAGS:', '')
          .trim()
          .replace(/^\[|\]$/g, '');
        result.tags = tagsStr
          .split(',')
          .map(t => t.trim())
          .filter(t => t);
      } else if (part.startsWith('CONTENT:')) {
        result.content = part.replace('CONTENT:', '').trim();
      }
    }

    // 默认值
    if (!result.title) {
      const titleMatch = content.match(/^#\s*(.+)$/m);
      result.title = titleMatch ? titleMatch[1] : '未命名文章';
    }

    if (!result.excerpt) {
      result.excerpt = result.content.slice(0, 100) + '...';
    }

    if (result.tags.length === 0) {
      result.tags = ['技术', '开发'];
    }

    return result;
  }
}
