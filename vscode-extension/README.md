# 🐵 大圣 VS Code 扩展

> **六耳猕猴·IDE 化身** - 超越贾维斯的 AI 开发助手

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/shuashuai/dasheng)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

大圣 VS Code 扩展是大圣工具链的第三期成果，将四大神通无缝集成到您的开发环境中。

## ✨ 特性

- 🌐 **语言通** - YAML 多语言文件智能同步翻译
- 📝 **译真经** - Markdown 智能翻译（保护 frontmatter 和代码块）
- 🎨 **画皮术** - 一键生成精美博客封面（5种风格）
- ✍️ **妙笔生花** - 根据 Release Notes 自动生成博客

## 📦 安装

### 从 VS Code 市场安装

1. 打开 VS Code
2. 按 `Ctrl+P` 打开命令面板
3. 输入 `ext install code-shuai.dasheng-vscode`
4. 点击安装

### 从 VSIX 安装

1. 下载最新版本的 `.vsix` 文件
2. 在 VS Code 中打开扩展面板 (`Ctrl+Shift+X`)
3. 点击右上角的 `...` 菜单
4. 选择 `从 VSIX 安装`

## 🚀 快速开始

### 1. 配置 AI API

打开 VS Code 设置 (`Ctrl+,`)，搜索 `dasheng`，配置以下选项：

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| `dasheng.ai.provider` | AI 提供商 | `openai` |
| `dasheng.ai.apiKey` | API 密钥 | - |
| `dasheng.ai.baseUrl` | 自定义 API 地址 | - |
| `dasheng.ai.model` | 模型名称 | `gpt-3.5-turbo` |

**推荐**：使用环境变量 `DASHENG_API_KEY` 或 `OPENAI_API_KEY` 存储 API 密钥，更加安全。

### 2. 打开大圣面板

按 `Ctrl+Shift+D` 或点击状态栏的 🐵 图标打开大圣面板。

## 📖 使用指南

### 🌐 YAML 翻译

**智能同步功能**：
- 自动检测新增、修改、删除的 key
- 三种同步模式：智能同步 / 仅增量 / 全量重译
- 分批处理，实时显示进度
- 支持取消操作

**方式一**：右键点击 YAML 文件 → 选择 `🌐 快速翻译 YAML`

**方式二**：
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 `Dasheng: 语言通`
3. 选择源文件、目标目录和目标语言
4. 选择同步模式（如果目标文件已存在）

**详细文档**：[YAML 智能同步指南](./docs/YAML_SYNC_GUIDE.md)

### 📝 Markdown 翻译

**方式一**：右键点击 Markdown 文件 → 选择 `📝 快速翻译 Markdown`

**方式二**：选中要翻译的文本 → 按 `Ctrl+Shift+T`

### 🎨 生成封面

1. 右键点击 Markdown 文件 → 选择 `🎨 为当前文件生成封面`
2. 选择风格和比例
3. 封面将保存为 SVG 格式（可转换为 PNG）

### ✍️ 生成博客

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 `Dasheng: 妙笔生花`
3. 选择输入源（Release Notes 文件或手动输入）
4. 选择博客风格
5. 生成的博客将保存在 `blog/` 目录

## ⌨️ 快捷键

| 快捷键 | 命令 |
|--------|------|
| `Ctrl+Shift+D` | 打开大圣面板 |
| `Ctrl+Shift+T` | 翻译选中文本 |

## ⚙️ 配置选项

### AI 配置

```json
{
  "dasheng.ai.provider": "openai",
  "dasheng.ai.apiKey": "your-api-key",
  "dasheng.ai.baseUrl": "https://api.openai.com/v1",
  "dasheng.ai.model": "gpt-3.5-turbo"
}
```

### 翻译配置

```json
{
  "dasheng.translation.defaultTargetLangs": ["zh-CN", "ja-JP", "ko-KR"],
  "dasheng.translation.preserveFormat": true
}
```

### 封面配置

```json
{
  "dasheng.cover.defaultStyle": "tech",
  "dasheng.cover.defaultRatio": "16:9"
}
```

### 博客配置

```json
{
  "dasheng.blog.defaultStyle": "release"
}
```

### 通用配置

```json
{
  "dasheng.general.autoDetectChanges": true,
  "dasheng.general.showNotifications": true
}
```

## 🛠️ 开发

### 环境要求

- Node.js >= 18
- VS Code >= 1.85.0

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/shuashuai/dasheng.git
cd dasheng/vscode-extension

# 安装依赖
npm install

# 代码检查
npm run lint

# 编译
npm run compile

# 调试
按 F5 打开扩展开发宿主
```

### 代码质量

```bash
# TypeScript 类型检查
npm run check-types

# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 代码格式化
npm run format

# 检查代码格式
npm run format:check
```

### 测试

```bash
# 运行所有测试
npm test

# 或使用测试脚本
./scripts/test.sh        # Linux/macOS/Git Bash
.\scripts\test.ps1       # Windows PowerShell
```

更多测试信息请参考 [docs/TESTING.md](docs/TESTING.md)

### 交付前验证

```bash
# 一键完成所有检查
npm run compile
```

**验证内容包括**:
1. ✅ TypeScript 类型检查
2. ✅ ESLint 代码规范
3. ✅ 构建打包

### 打包发布

```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包
vsce package

# 发布（需要权限）
vsce publish
```

## 📁 项目结构

```
vscode-extension/
├── src/
│   ├── commands/           # 命令实现
│   │   ├── yamlTranslate.ts
│   │   ├── markdownTranslate.ts
│   │   ├── coverGenerate.ts
│   │   ├── blogGenerate.ts
│   │   └── translationHelper.ts
│   ├── providers/          # 视图提供器
│   │   ├── sidebarProvider.ts
│   │   └── dashboardProvider.ts
│   ├── utils/              # 工具类
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   └── aiProvider.ts
│   └── extension.ts        # 入口文件
├── media/                  # 静态资源
├── docs/                   # 文档
├── package.json           # 扩展配置
└── README.md
```

## 🗺️ 路线图

- [x] v3.0.0 六耳猕猴 - VS Code 扩展 ✅
  - [x] 侧边栏视图
  - [x] Dashboard 面板
  - [x] 四大核心功能
  - [x] 右键菜单集成
  - [ ] AI 图片生成封面
  - [ ] 实时预览
  - [ ] 团队协作功能

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT License

## 🙏 致谢

- 基于 [大圣 CLI](https://github.com/shuashuai/dasheng) 核心功能构建
- 感谢所有贡献者和用户

---

<p align="center">
  <strong>🐵 七十二变，无所不能！</strong>
</p>
