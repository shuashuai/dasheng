# 🐵 大圣 (Dasheng) CLI 使用手册

> **超越贾维斯的 72 变 AI 助手**

## 📚 目录

- [简介](#简介)
- [安装](#安装)
- [快速开始](#快速开始)
  - [TUI 交互界面（推荐）](#tui-交互界面)
  - [CLI 命令行](#cli-命令行)
- [功能详解](#功能详解)
  - [七十二变·语言通 (YAML翻译)](#七十二变语言通)
  - [七十二变·译真经 (Markdown翻译)](#七十二变译真经)
  - [七十二变·妙笔生花 (博客生成)](#七十二变妙笔生花)
  - [七十二变·画皮术 (封面生成)](#七十二变画皮术)
- [TUI 使用指南](#tui-使用指南)
- [配置指南](#配置指南)
- [高级用法](#高级用法)
- [常见问题](#常见问题)

---

## 简介

**大圣 (Dasheng)** 是一款功能强大的 AI CLI 工具，提供 4 大核心能力：

| 功能 | 命令 | 描述 |
|------|------|------|
| 🌐 语言通 | `translate-yaml` | 多语言 YAML 文件自动翻译同步 |
| 📝 译真经 | `translate-md` | Markdown 文档翻译（保护代码块和 Frontmatter） |
| ✍️ 妙笔生花 | `generate-blog` | 根据 Release Notes 或要点生成博客文章 |
| 🎨 画皮术 | `generate-cover` | 为博客生成精美的封面图片 |

---

## 安装

### 环境要求

- Node.js 18+
- pnpm 8+（推荐）或 npm

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourname/dasheng.git
cd dasheng

# 安装依赖
pnpm install

# 编译 TypeScript
pnpm build

# 可选：链接到全局（可在任意目录使用 dasheng 命令）
pnpm link --global
```

### 本地使用

```bash
# 不全局安装，直接使用
node dist/cli.js --help
```

---

## 快速开始

### 1. 配置 API Key

创建 `.env` 文件：

```bash
# 使用 DeepSeek（推荐，国内可用）
OPENAI_API_KEY=your-deepseek-api-key
OPENAI_BASE_URL=https://api.deepseek.com/v1

# 或使用 Kimi (Moonshot)
# OPENAI_API_KEY=your-kimi-api-key
# OPENAI_BASE_URL=https://api.moonshot.cn/v1

# 或使用 OpenAI
# OPENAI_API_KEY=your-openai-api-key
```

### 2. 验证安装

```bash
dasheng --help
```

### 3. 使用方式

#### TUI 交互界面（推荐）

```bash
# 启动交互式 TUI 界面
dasheng tui
# 或
dasheng ui
```

TUI 界面提供可视化交互体验，通过键盘操作即可轻松完成各种任务。

**键盘操作：**
- `← →` / `Tab` - 切换功能 Tab
- `↑ ↓` - 选择功能或选项
- `Enter` - 确认
- `q` / `Ctrl+C` - 退出

#### CLI 命令行

```bash
# 翻译 YAML 文件
dasheng translate-yaml ./locales/en.yaml --target ./locales/

# 生成博客封面
dasheng generate-cover -t "我的第一篇博客" --style tech
```

---

## 功能详解

### 七十二变·语言通

**功能**：自动翻译 YAML 多语言文件，智能检测新增/删除的 key

**基本用法**：

```bash
# 基础翻译（增量模式）
dasheng translate-yaml ./en.yaml --target ./locales/

# 指定目标语言
dasheng translate-yaml ./en.yaml \
  --target ./locales/ \
  --lang zh-CN ja-JP ko-KR

# 强制重新翻译所有内容
dasheng translate-yaml ./en.yaml \
  --target ./locales/ \
  --force

# 试演模式（预览不实际修改）
dasheng translate-yaml ./en.yaml \
  --target ./locales/ \
  --dry-run
```

**工作原理**：

1. 读取基础语言文件（如 `en.yaml`）
2. 扫描目标目录下的语言文件
3. 对比 key 差异：
   - ✅ 已有 key：保持不变（`--force` 时重新翻译）
   - ⚠️ 缺失 key：调用 AI 翻译并添加
   - ❌ 多余 key：删除目标文件中的多余 key
4. 保存更新后的文件

**示例输出**：

```
🐵 召唤神通：七十二变·语言通

🤖 使用 AI 服务: DeepSeek

基础文件: test/locales/en.yaml
共有 18 个 key

目标语言: zh-CN

📄 zh-CN.yaml
   ✓ 已有: 13 个
   ⚠ 缺失: 5 个
   ✗ 多余: 0 个

处理: zh-CN.yaml
  新增 5 个 key，正在翻译...
  已保存: test/locales/zh-CN.yaml

✅ 语言通神通施展完成！

📄 test/locales/zh-CN.yaml
   新增: 5
   更新: 0
   删除: 0
   不变: 13
```

---

### 七十二变·译真经

**功能**：翻译 Markdown 文档，智能保护代码块、链接、Frontmatter

**基本用法**：

```bash
# 基础翻译
dasheng translate-md ./blog-post.md

# 指定目标语言
dasheng translate-md ./blog-post.md --target-lang ja-JP

# 指定输出文件
dasheng translate-md ./blog-post.md \
  --target-lang zh-CN \
  --output ./blog-post-zh.md

# 不翻译 Frontmatter
dasheng translate-md ./blog-post.md --no-keep-frontmatter
```

**保护的内容**：

- ✅ **Frontmatter**：YAML 头部元数据
- ✅ **代码块**：\`\`\`...\`\`\` 包裹的内容
- ✅ **行内代码**：`code` 格式
- ✅ **链接**：[text](url) - 翻译 text，保护 url
- ✅ **图片**：![alt](url) - 完全保护
- ✅ **HTML 标签**：`<tag>` 格式的内容

**示例**：

输入文件：
```markdown
---
title: Getting Started
description: A guide to getting started
---

# Getting Started

This is a guide to help you get started.

```bash
npm install dasheng
```

Visit our [GitHub](https://github.com/user/repo).
```

输出文件（中文）：
```markdown
---
title: 入门指南
description: 入门指南
---

# 入门指南

这是一份帮助您入门的指南。

```bash
npm install dasheng
```

访问我们的 [GitHub](https://github.com/user/repo)。
```

---

### 七十二变·妙笔生花

**功能**：根据 Release Notes 或关键信息自动生成博客文章

**基本用法**：

```bash
# 从 Release Notes 生成
dasheng generate-blog ./RELEASE_NOTES.md

# 指定风格
dasheng generate-blog ./RELEASE_NOTES.md \
  --style tutorial

# 生成多篇文章供选择
dasheng generate-blog ./RELEASE_NOTES.md \
  --multi 3

# 不使用文件，直接指定主题
dasheng generate-blog \
  --topic "React 19 新特性" \
  --points "并发渲染,Server Components,Actions" \
  --style news

# 交互式输入
dasheng generate-blog --interactive
```

**支持的风格**：

| 风格 | 说明 | 适用场景 |
|------|------|----------|
| `release` | 版本发布 | 产品更新公告 |
| `tutorial` | 教程指南 | 技术教程、入门指南 |
| `news` | 新闻资讯 | 行业动态、产品发布 |
| `deep-dive` | 深度分析 | 技术原理、架构设计 |
| `story` | 故事叙述 | 场景化讲述、用户体验 |

**输出格式**：

生成的博客包含：
- Frontmatter（title, excerpt, date, tags）
- 结构化正文（特性、改进、Bug修复等）
- 代码示例
- 升级指南（版本发布类）

---

### 七十二变·画皮术

**功能**：为博客文章生成精美的封面图片

**基本用法**：

```bash
# 从 Markdown 文件提取标题生成
dasheng generate-cover ./blog-post.md

# 指定风格
dasheng generate-cover ./blog-post.md --style gradient

# 手动指定标题
dasheng generate-cover \
  --topic "大圣 1.0 发布" \
  --subtitle "超越贾维斯的 AI 助手" \
  --author "大圣团队"

# 自定义尺寸（任意宽高）
dasheng generate-cover \
  --topic "自定义尺寸" \
  --width 1200 --height 630

# 添加自定义 Prompt（显示在封面）
dasheng generate-cover \
  --topic "AI 绘画" \
  --prompt "A futuristic AI art cover with neural networks"
```

**风格选项**：

| 风格 | 特点 |
|------|------|
| `tech` | 深蓝紫渐变 + 网格 + 几何装饰 |
| `minimal` | 纯白 + 极简排版 + 细微纹理 |
| `gradient` | 多彩流体渐变 + 波纹效果 |
| `illustration` | 温暖米色 + 手绘元素 |
| `business` | 深色背景 + 金色装饰 |

**比例选项**：

| 比例 | 默认尺寸 | 适用场景 |
|------|----------|----------|
| `16:9` | 1920x1080 | 博客横幅、YouTube |
| `1:1` | 1200x1200 | 微信、Instagram |
| `9:16` | 1080x1920 | 抖音、小红书 |
| `4:3` | 1600x1200 | PPT、文章配图 |

**自定义尺寸示例**：

```bash
# 微信公众号封面（900x383）
dasheng generate-cover -t "文章标题" --width 900 --height 383

# 小红书封面（1242x1660）
dasheng generate-cover -t "穿搭分享" --width 1242 --height 1660

# 4K 壁纸（3840x2160）
dasheng generate-cover -t "技术博客" --width 3840 --height 2160
```

---

## TUI 使用指南

### 简介

大圣 v2.0 引入了 TUI (Terminal User Interface) 交互界面，提供可视化的操作体验，无需记忆复杂的命令行参数。

### 启动 TUI

```bash
dasheng tui
# 或
dasheng ui
```

### 界面布局

```
┌─────────────────────────────────────────┐
│  🐵 大圣 Dasheng  |  通背猿猴 v2.0      │  <- Header
├─────────────────────────────────────────┤
│  🏠首页  🌐语言通  📝译真经  🎨画皮术  ✍️妙笔 │  <- Tab 导航
├─────────────────────────────────────────┤
│                                         │
│         Main Content Area               │  <- 内容区
│         (功能向导或结果展示)              │
│                                         │
├─────────────────────────────────────────┤
│ [Tab/←→] 切换 [Enter] 确认 [q] 退出     │  <- Footer
└─────────────────────────────────────────┘
```

### 功能向导

#### 🌐 语言通 - YAML 翻译向导

步骤流程：
1. **选择基础文件** - 输入基础语言 YAML 文件路径（如 `./locales/en.yaml`）
2. **输入目标目录** - 设置目标语言文件存放目录（默认 `./locales/`）
3. **选择目标语言** - 选择要翻译成的语言（支持多选）
4. **配置试演模式** - 是否预览而不实际修改文件
5. **配置强制重译** - 是否重新翻译已存在的 key
6. **确认并开始** - 查看配置摘要，确认后执行翻译

**支持的命令行选项在 TUI 中都有对应配置。**

#### 📝 译真经 - Markdown 翻译向导

步骤流程：
1. **选择 Markdown 文件** - 输入要翻译的 Markdown 文件路径
2. **选择目标语言** - 选择翻译目标语言
3. **输入输出路径** - 可选，留空自动生成
4. **配置 frontMatter** - 是否保持 frontMatter 格式不变
5. **执行翻译** - 显示翻译进度和结果

#### 🎨 画皮术 - 封面生成向导

步骤流程：
1. **选择内容来源** - 从 Markdown 文件提取或直接输入主题
2. **输入文件/主题** - 根据选择输入对应内容
3. **选择设计风格** - 科技风/简约风/渐变风/插画风/商务风
4. **选择画面比例** - 16:9 / 1:1 / 9:16 / 4:3 / 21:9
5. **配置输出路径** - 可选，留空自动生成
6. **输入副标题** - 可选
7. **输入作者名** - 可选
8. **确认配置** - 查看所有配置项
9. **生成封面** - 显示生成进度
10. **查看结果** - 显示生成的文件路径

#### ✍️ 妙笔生花 - 博客生成向导

步骤流程：
1. **选择内容来源** - 从 Release Notes 文件或手动输入主题
2. **输入文件/主题** - 根据选择输入对应内容
3. **输入关键要点** - 用逗号分隔的关键信息点（可选）
4. **选择博客风格** - 版本发布/教程指南/新闻资讯/深度分析/故事叙述
5. **选择目标读者** - 初级/中级/高级开发者、架构师等
6. **配置输出路径** - 可选，留空自动生成
7. **确认并开始** - 查看配置摘要
8. **生成博客** - AI 创作中...
9. **查看结果** - 显示生成的文件和博客信息

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `←` / `→` | 切换顶部 Tab |
| `Tab` | 切换到下一个 Tab |
| `↑` / `↓` | 在列表中选择选项 |
| `Enter` | 确认当前选择 |
| `y` | Confirm 组件中选择 Yes |
| `n` | Confirm 组件中选择 No |
| `q` | 退出 TUI |
| `Ctrl+C` | 强制退出 |

### 与 CLI 的关系

- **TUI** 适合：交互式操作、可视化配置、新手使用
- **CLI** 适合：脚本自动化、CI/CD 集成、批量处理

两者完全兼容，CLI 命令行功能在 TUI 中都有对应的交互式向导。

---

## 配置指南

### API Key 获取

#### DeepSeek（推荐）

1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册账号并登录
3. 进入「API Keys」创建新 Key
4. 充值余额（¥10-20 足够测试）

#### Kimi (Moonshot)

1. 访问 [platform.moonshot.cn](https://platform.moonshot.cn)
2. 使用手机号登录
3. 创建 API Key
4. 新用户有 ¥15 免费额度

### 环境变量配置

**Windows PowerShell**：
```powershell
$env:OPENAI_API_KEY="sk-xxx"
$env:OPENAI_BASE_URL="https://api.deepseek.com/v1"
```

**Windows CMD**：
```cmd
set OPENAI_API_KEY=sk-xxx
set OPENAI_BASE_URL=https://api.deepseek.com/v1
```

**macOS / Linux**：
```bash
export OPENAI_API_KEY="sk-xxx"
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
```

**永久配置（推荐）**：

在项目根目录创建 `.env` 文件：
```env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

---

## 高级用法

### 演示模式

无需 API Key，使用模拟数据测试功能：

```bash
# 设置环境变量
$env:DASHENG_MOCK="true"

# 或使用演示模式运行
dasheng translate-yaml ./en.yaml --target ./locales/
```

### 批量处理

结合 shell 脚本批量处理文件：

```bash
# 批量翻译多个 Markdown 文件
for file in ./docs/*.md; do
  dasheng translate-md "$file" --target-lang zh-CN
done

# 为所有博客生成封面
for file in ./blog/*.md; do
  dasheng generate-cover "$file" --style tech
done
```

### CI/CD 集成

在 GitHub Actions 中使用：

```yaml
name: Sync Translations
on:
  push:
    paths:
      - 'locales/en.yaml'

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: node dist/cli.js translate-yaml ./locales/en.yaml --target ./locales/
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_BASE_URL: https://api.deepseek.com/v1
```

---

## 常见问题

### Q: Windows 上 generate-cover 报错 "surface type is not appropriate"

**A**: 这是 Windows PowerShell 与 node-canvas 的兼容性问题。解决方案：

1. 使用 CMD 或 Git Bash 代替 PowerShell
2. 或者在代码中直接调用 `CoverGenerator` 类

### Q: 翻译质量不理想

**A**: 

1. **使用 `--force` 重新翻译**：`dasheng translate-yaml ./en.yaml --force`
2. **检查 API Key 余额**：确保账户有余额
3. **更换 AI 服务商**：尝试 DeepSeek、Kimi 等不同服务商
4. **添加上下文**：在 YAML 中使用注释提供翻译语境

### Q: 如何添加新的目标语言？

**A**: 

```bash
# 只需在目标目录创建空的语言文件
touch locales/fr.yaml

# 运行翻译命令，会自动填充
dasheng translate-yaml ./locales/en.yaml --target ./locales/
```

### Q: 封面上的文字显示不正确？

**A**: 

1. 确保使用英文或通用字体支持的语言
2. 中文支持已内置，使用 Arial 字体
3. 如需特殊语言，可能需要安装对应字体

### Q: 如何自定义封面背景？

**A**: 

目前支持 5 种内置风格。如需更高级的自定义：

1. 使用 `--prompt` 添加提示词说明
2. 修改 `src/core/services/cover-generator.ts` 中的绘制逻辑
3. 未来版本将支持 AI 生成背景图

### Q: API 调用失败/超时？

**A**: 

1. 检查网络连接
2. 确认 API Key 正确且未过期
3. 检查 BASE_URL 是否正确
4. 查看服务商状态页面

---

## 更新日志

### v2.0.0 - 通背猿猴

- ✅ **TUI 交互界面** - 全新的 Terminal User Interface
- ✅ **交互式向导** - 所有功能都支持可视化向导操作
- ✅ **键盘导航** - 完整的键盘快捷键支持
- ✅ **实时进度** - 可视化进度指示器
- ✅ **结果展示** - 美观的成功/失败结果页面

### v1.0.0 - 石猴出世

- ✅ 七十二变·语言通 - YAML 翻译
- ✅ 七十二变·译真经 - Markdown 翻译
- ✅ 七十二变·妙笔生花 - 博客生成
- ✅ 七十二变·画皮术 - 封面生成
- ✅ DeepSeek / Kimi / OpenAI 支持
- ✅ 自定义尺寸和 Prompt

---

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT License

---

🐵 **大圣 - 72 变无所不能，一棒扫清万难！**
