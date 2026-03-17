---
title: Getting Started with Dasheng
description: A comprehensive guide to using the Dasheng CLI tool
date: 2026-03-17
author: Dasheng Team
tags: [cli, ai, translation]
---

# Getting Started with Dasheng

Dasheng (大圣) is a powerful AI assistant CLI tool with 72 transformations, designed to be more capable than Jarvis.

## Features

### 1. Language Translation (七十二变·语言通)

Translate YAML localization files with ease. The tool automatically detects missing keys and translates them using AI.

```bash
# Translate YAML files
dasheng translate-yaml ./en.yaml --target ./locales/
```

### 2. Markdown Translation (七十二变·译真经)

Translate Markdown files while preserving:
- Frontmatter metadata
- Code blocks
- Links and images
- HTML tags

Example code:
```javascript
const dasheng = require('dasheng');

// Translate a blog post
await dasheng.translate('./post.md', 'zh-CN');
```

### 3. Blog Generation (七十二变·妙笔生花)

Generate blog posts from release notes or key points.

## Installation

You can install Dasheng via npm:

```bash
npm install -g dasheng
```

Or use it with npx:

```bash
npx dasheng translate-yaml ./en.yaml
```

## Configuration

Set up your environment variables:

```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
```

## Links

- [GitHub Repository](https://github.com/yourname/dasheng)
- [Documentation](https://dasheng.dev/docs)
- [npm Package](https://npmjs.com/package/dasheng)

## Images

![Dasheng Logo](https://example.com/dasheng-logo.png)

## Conclusion

Dasheng is designed to make your development workflow more efficient. With its 72 transformations, it can handle various tasks from translation to content generation.

Happy coding! 🐵
