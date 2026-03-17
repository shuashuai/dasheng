---
title: 大圣入门指南
description: 大圣CLI工具使用全面指南
date: 2026-03-17T00:00:00.000Z
author: 大圣团队
tags:
  - cli
  - ai
  - translation
---
# 大圣入门指南

大圣是一款拥有七十二般变化的强大AI助手CLI工具，旨在比贾维斯更全能。

## 功能特性

### 1. 语言翻译（七十二变·语言通）

轻松翻译YAML本地化文件。该工具能自动检测缺失的键值，并使用AI进行翻译。

```bash
# Translate YAML files
dasheng translate-yaml ./en.yaml --target ./locales/
```

### 2. Markdown翻译（七十二变·译真经）

翻译Markdown文件，同时保留：
- Frontmatter元数据
- 代码块
- 链接和图片
- HTML标签

示例代码：
```javascript
const dasheng = require('dasheng');

// Translate a blog post
await dasheng.translate('./post.md', 'zh-CN');
```

### 3. 博客生成（七十二变·妙笔生花）

根据发布说明或关键点生成博客文章。

## 安装

你可以通过npm安装大圣：

```bash
npm install -g dasheng
```

或者使用npx：

```bash
npx dasheng translate-yaml ./en.yaml
```

## 配置

设置你的环境变量：

```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
```

## 链接

- [GitHub仓库](https://github.com/yourname/dasheng)
- [文档](https://dasheng.dev/docs)
- [npm包](https://npmjs.com/package/dasheng)

## 图片

![大圣Logo](https://example.com/dasheng-logo.png)

## 结语

大圣旨在让你的开发工作流程更高效。凭借其七十二般变化，它可以处理从翻译到内容生成的各种任务。

编码愉快！ 🐵
