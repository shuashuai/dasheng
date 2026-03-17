// 🐵 大圣类型定义 - 七十二变神通体系

// ==================== 配置类型 ====================

export interface AppConfig {
  translation: TranslationConfig;
  cover: CoverConfig;
  blog: BlogConfig;
  ai: AIConfig;
}

export interface TranslationConfig {
  baseLanguage: string;
  targetLanguages: string[];
  contextMap?: string;
  preserveFormat: boolean;
}

export interface CoverConfig {
  defaultStyle: CoverStyle;
  defaultRatio: string;
  outputDir: string;
  fontFamily?: string;
}

export interface BlogConfig {
  defaultStyle: BlogStyle;
  templatesDir: string;
  maxTokens: number;
}

export interface AIConfig {
  provider: "openai" | "anthropic" | "local";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// ==================== 风格类型 ====================

export type CoverStyle =
  | "tech" // 科技风 - 蓝紫渐变
  | "minimal" // 简约风 - 纯色背景
  | "gradient" // 渐变风 - 多彩流体
  | "illustration" // 插画风 - 手绘温暖
  | "business"; // 商务风 - 深色金色

export type BlogStyle =
  | "release" // 版本发布型
  | "tutorial" // 教程型
  | "news" // 新闻资讯型
  | "deep-dive" // 深度分析型
  | "story"; // 故事型

// ==================== 翻译相关类型 ====================

export interface ContextMap {
  exact: Record<string, Record<string, string>>;
  pattern: Record<string, string>;
}

export interface YamlDiff {
  missing: string[];
  extra: string[];
  changed: string[];
}

export interface YamlNode {
  key: string;
  value: string | YamlNode[];
  path: string;
}

// ==================== Blog 相关类型 ====================

export interface ReleaseNotes {
  version: string;
  date: string;
  features: string[];
  improvements: string[];
  bugfixes: string[];
  breakingChanges: string[];
  raw: string;
}

export interface BlogInput {
  topic?: string;
  keyPoints?: string[];
  targetAudience?: string;
  style?: BlogStyle;
  rawContent?: string;
}

export interface BlogOutput {
  title: string;
  excerpt: string;
  content: string;
  style: BlogStyle;
  tags: string[];
}

export interface StyleRecommendation {
  style: BlogStyle;
  confidence: number;
  reason: string;
}

// ==================== CLI 输出类型 ====================

export interface OutputFormat {
  cli: string;
  json: object;
}

export interface TranslateYamlOptions {
  target?: string;
  lang?: string[];
  dryRun?: boolean;
  force?: boolean;
  config?: string;
}

export interface TranslateMdOptions {
  targetLang?: string;
  output?: string;
  keepFrontmatter?: boolean;
}

export interface GenerateCoverOptions {
  style?: CoverStyle;
  ratio?: string;
  output?: string;
  width?: number;
  height?: number;
  topic?: string;
  subtitle?: string;
  author?: string;
  prompt?: string;
}

export interface GenerateBlogOptions {
  style?: BlogStyle;
  topic?: string;
  points?: string;
  audience?: string;
  output?: string;
  copy?: boolean;
  interactive?: boolean;
  multi?: number;
}
