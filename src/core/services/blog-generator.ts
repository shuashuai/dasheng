// ✍️ 七十二变·妙笔生花 - 博客生成服务

import { writeFileSync } from "fs";
import chalk from "chalk";
import type { AIProvider } from "../providers/ai-provider.js";
import { createAIProvider, MockProvider } from "../providers/ai-provider.js";
import type {
  BlogStyle,
  BlogInput,
  BlogOutput,
  ReleaseNotes,
} from "../../types/index.js";

export interface BlogGenerateResult {
  articles: BlogOutput[];
  outputFiles: string[];
}

/**
 * 博客生成器
 * 根据 Release Notes 或关键信息生成博客文章
 */
export class BlogGenerator {
  private aiProvider: AIProvider;

  constructor(config: {
    provider: "openai" | "anthropic" | "local";
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
   * 解析 Release Notes
   */
  parseReleaseNotes(content: string): ReleaseNotes {
    const result: ReleaseNotes = {
      version: "",
      date: new Date().toISOString().split("T")[0],
      features: [],
      improvements: [],
      bugfixes: [],
      breakingChanges: [],
      raw: content,
    };

    // 尝试提取版本号
    const versionMatch =
      content.match(/#?\s*[Vv]ersion\s+(\d+\.\d+\.?\d*)/) ||
      content.match(/##?\s*(\d+\.\d+\.?\d+)/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }

    // 尝试提取日期
    const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      result.date = dateMatch[1];
    }

    // 提取各部分内容
    const sections = content.split(/#{2,3}\s+/);

    for (const section of sections) {
      const lowerSection = section.toLowerCase();

      if (
        lowerSection.includes("feature") ||
        lowerSection.includes("新增") ||
        lowerSection.includes("新功能")
      ) {
        result.features = this.extractListItems(section);
      } else if (
        lowerSection.includes("improvement") ||
        lowerSection.includes("优化") ||
        lowerSection.includes("改进")
      ) {
        result.improvements = this.extractListItems(section);
      } else if (
        lowerSection.includes("bug") ||
        lowerSection.includes("修复")
      ) {
        result.bugfixes = this.extractListItems(section);
      } else if (
        lowerSection.includes("breaking") ||
        lowerSection.includes("破坏性")
      ) {
        result.breakingChanges = this.extractListItems(section);
      }
    }

    // 如果没有提取到任何内容，将整个内容作为特性
    if (
      result.features.length === 0 &&
      result.improvements.length === 0 &&
      result.bugfixes.length === 0 &&
      result.breakingChanges.length === 0
    ) {
      result.features = content
        .split("\n")
        .filter(
          (line) => line.trim().startsWith("-") || line.trim().startsWith("*"),
        )
        .map((line) => line.replace(/^[\s*\\-]+/, "").trim());
    }

    return result;
  }

  /**
   * 提取列表项
   */
  private extractListItems(section: string): string[] {
    const lines = section.split("\n");
    const items: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        items.push(trimmed.replace(/^[\s*\\-]+/, "").trim());
      }
    }

    return items;
  }

  /**
   * 生成博客
   */
  async generate(input: BlogInput, count: number = 1): Promise<BlogOutput[]> {
    const articles: BlogOutput[] = [];

    for (let i = 0; i < count; i++) {
      const article = await this.generateSingle(input, i);
      articles.push(article);
    }

    return articles;
  }

  /**
   * 生成单篇文章
   */
  private async generateSingle(
    input: BlogInput,
    index: number,
  ): Promise<BlogOutput> {
    const style = input.style || "release";
    const prompt = this.buildPrompt(input, style, index);

    try {
      const content = await this.aiProvider.complete(prompt, {
        temperature: 0.7 + index * 0.1, // 多篇文章时增加变化
        maxTokens: 4000,
      });

      return this.parseGeneratedContent(content, style);
    } catch (error) {
      console.error(chalk.red("生成博客失败:"), error);
      throw error;
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    input: BlogInput,
    style: BlogStyle,
    variation: number,
  ): string {
    const basePrompt = `请根据以下信息生成一篇${this.getStyleName(style)}风格的博客文章。\n\n`;

    let contentPrompt = "";

    if (input.rawContent) {
      // 从 Release Notes 解析
      const notes = this.parseReleaseNotes(input.rawContent);
      contentPrompt = this.buildReleaseNotesPrompt(notes);
    } else {
      // 从用户提供的信息构建
      contentPrompt = this.buildCustomPrompt(input);
    }

    const stylePrompt = this.getStylePrompt(style);
    const formatPrompt = this.getFormatPrompt(variation);

    return basePrompt + contentPrompt + stylePrompt + formatPrompt;
  }

  /**
   * 构建 Release Notes 提示词
   */
  private buildReleaseNotesPrompt(notes: ReleaseNotes): string {
    let prompt = "";

    if (notes.version) {
      prompt += `版本号: ${notes.version}\n`;
    }
    if (notes.date) {
      prompt += `发布日期: ${notes.date}\n`;
    }

    if (notes.features.length > 0) {
      prompt += `\n新特性:\n${notes.features.map((f) => `- ${f}`).join("\n")}\n`;
    }

    if (notes.improvements.length > 0) {
      prompt += `\n优化改进:\n${notes.improvements.map((i) => `- ${i}`).join("\n")}\n`;
    }

    if (notes.bugfixes.length > 0) {
      prompt += `\nBug修复:\n${notes.bugfixes.map((b) => `- ${b}`).join("\n")}\n`;
    }

    if (notes.breakingChanges.length > 0) {
      prompt += `\n破坏性变更:\n${notes.breakingChanges.map((c) => `- ${c}`).join("\n")}\n`;
    }

    return prompt;
  }

  /**
   * 构建自定义提示词
   */
  private buildCustomPrompt(input: BlogInput): string {
    let prompt = "";

    if (input.topic) {
      prompt += `主题: ${input.topic}\n`;
    }

    if (input.keyPoints && input.keyPoints.length > 0) {
      prompt += `\n关键要点:\n${input.keyPoints.map((p) => `- ${p}`).join("\n")}\n`;
    }

    if (input.targetAudience) {
      prompt += `\n目标读者: ${input.targetAudience}\n`;
    }

    return prompt || "请生成一篇技术博客文章。";
  }

  /**
   * 获取风格名称
   */
  private getStyleName(style: BlogStyle): string {
    const names: Record<BlogStyle, string> = {
      release: "版本发布",
      tutorial: "教程",
      news: "新闻资讯",
      "deep-dive": "深度分析",
      story: "故事",
    };
    return names[style] || "技术";
  }

  /**
   * 获取风格提示
   */
  private getStylePrompt(style: BlogStyle): string {
    const prompts: Record<BlogStyle, string> = {
      release: `
\n风格要求: 版本发布
- 标题要体现版本号和主要亮点
- 开头简述本次更新的核心价值
- 正文分章节介绍新特性、改进和修复
- 结尾包含升级指南和致谢
- 语气专业、清晰、令人兴奋`,

      tutorial: `
\n风格要求: 教程指南
- 标题要有"如何"、"入门"等教学词汇
- 假设读者是初学者，循序渐进
- 包含代码示例和步骤说明
- 提供实用的技巧和最佳实践
- 语气友好、耐心、实用`,

      news: `
\n风格要求: 新闻资讯
- 标题要吸引眼球，概括核心信息
- 倒金字塔结构：重要信息前置
- 客观陈述事实，引用数据和来源
- 包含背景和意义分析
- 语气客观、简洁、权威`,

      "deep-dive": `
\n风格要求: 深度分析
- 标题要有洞察力和思考深度
- 深入探讨技术原理和设计决策
- 包含架构图、流程图等概念性描述
- 对比分析不同方案的优劣
- 语气严谨、深入、有见地`,

      story: `
\n风格要求: 故事叙述
- 标题要有故事性和情感共鸣
- 以场景或问题引入
- 讲述解决问题的过程
- 包含人物视角和情感体验
- 语气生动、有温度、引人入胜`,
    };

    return prompts[style] || prompts["release"];
  }

  /**
   * 获取格式提示
   */
  private getFormatPrompt(variation: number): string {
    return `
\n输出格式要求:
请严格按照以下格式输出，使用 --- 分隔各部分：

TITLE: [博客标题]
---
EXCERPT: [一句话摘要，50字以内]
---
TAGS: [标签1, 标签2, 标签3]
---
CONTENT:
[博客正文，使用 Markdown 格式]

注意:
- 正文使用 Markdown 格式
- 包含适当的标题层级 (## ###)
- 代码块使用 \`\`\`language 格式
- 第 ${variation + 1} 篇文章要有不同的切入角度或表达方式
`;
  }

  /**
   * 解析生成的内容
   */
  private parseGeneratedContent(content: string, style: BlogStyle): BlogOutput {
    const parts = content.split("---").map((p) => p.trim());

    const result: BlogOutput = {
      title: "",
      excerpt: "",
      content: content,
      style,
      tags: [],
    };

    for (const part of parts) {
      if (part.startsWith("TITLE:")) {
        result.title = part.replace("TITLE:", "").trim();
      } else if (part.startsWith("EXCERPT:")) {
        result.excerpt = part.replace("EXCERPT:", "").trim();
      } else if (part.startsWith("TAGS:")) {
        let tagsStr = part.replace("TAGS:", "").trim();
        // 移除可能存在的方括号
        tagsStr = tagsStr.replace(/^\[|\]$/g, "");
        result.tags = tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
      } else if (part.startsWith("CONTENT:")) {
        result.content = part.replace("CONTENT:", "").trim();
      }
    }

    // 如果没解析到内容，使用原始内容
    if (!result.title) {
      const titleMatch = content.match(/^#\s*(.+)$/m);
      result.title = titleMatch ? titleMatch[1] : "未命名文章";
    }

    if (!result.excerpt) {
      result.excerpt = content.slice(0, 100) + "...";
    }

    if (result.tags.length === 0) {
      result.tags = ["技术", "开发"];
    }

    return result;
  }

  /**
   * 保存文章到文件
   */
  saveToFile(article: BlogOutput, filePath: string): void {
    const frontmatter = `---
title: ${article.title}
excerpt: ${article.excerpt}
date: ${new Date().toISOString().split("T")[0]}
tags: [${article.tags.map((t) => `"${t}"`).join(", ")}]
style: ${article.style}
---

`;

    const fullContent = frontmatter + article.content;
    writeFileSync(filePath, fullContent, "utf-8");
  }
}
