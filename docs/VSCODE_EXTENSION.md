# VS Code 扩展开发文档

## 项目概述

大圣 VS Code 扩展（代号：**六耳猕猴**）是大圣工具链的第三期成果，将 AI 辅助开发能力无缝集成到 VS Code 编辑器中。

## 功能清单

### 已实现功能 ✅

#### 🌐 语言通 - YAML 翻译
- [x] 完整的 YAML 文件翻译流程
- [x] 自动检测 key 差异
- [x] 支持 50+ 种目标语言
- [x] 右键快捷菜单
- [x] 进度通知

#### 📝 译真经 - Markdown 翻译
- [x] 保护 frontmatter
- [x] 保护代码块、链接、图片
- [x] 选中文本快速翻译
- [x] 批量段落翻译

#### 🎨 画皮术 - 封面生成
- [x] 5 种风格 SVG 封面生成
- [x] 多种比例支持
- [x] 从 Markdown 提取信息
- [x] 实时预览

#### ✍️ 妙笔生花 - 博客生成
- [x] 从 Release Notes 生成
- [x] 5 种写作风格
- [x] 自动生成 frontmatter
- [x] 多输入源支持

#### 🖥️ 用户界面
- [x] 侧边栏视图
- [x] Dashboard 面板
- [x] 状态栏按钮
- [x] 快捷键支持

#### ⚙️ 配置系统
- [x] 完整的配置项
- [x] 环境变量支持
- [x] 配置监听
- [x] 配置验证

### 计划中功能 📋

#### v3.1.0
- [ ] AI 图片生成封面
- [ ] 翻译历史记录
- [ ] 批量文件处理
- [ ] 翻译缓存

#### v3.2.0
- [ ] 实时预览面板
- [ ] 自定义模板
- [ ] 团队协作功能
- [ ] 云端配置同步

#### v4.0.0
- [ ] 与 Web 界面联动
- [ ] 高级 AI 功能
- [ ] 插件市场

## 技术栈

- **语言**: TypeScript 5.x
- **框架**: VS Code Extension API
- **构建**: esbuild
- **AI SDK**: OpenAI SDK
- **UI**: Webview (HTML/CSS/JS)

## 项目结构

```
vscode-extension/
├── src/
│   ├── extension.ts              # 入口文件
│   ├── commands/                 # 命令实现
│   │   ├── yamlTranslate.ts
│   │   ├── markdownTranslate.ts
│   │   ├── coverGenerate.ts
│   │   ├── blogGenerate.ts
│   │   └── translationHelper.ts
│   ├── providers/                # 视图提供器
│   │   ├── sidebarProvider.ts
│   │   └── dashboardProvider.ts
│   └── utils/                    # 工具类
│       ├── config.ts
│       ├── logger.ts
│       └── aiProvider.ts
├── docs/                         # 文档
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── TROUBLESHOOTING.md
├── media/                        # 静态资源
├── package.json                  # 扩展配置
├── tsconfig.json                 # TS 配置
└── esbuild.js                    # 构建配置
```

## 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 函数和类必须有类型注解
- 公共 API 必须有 JSDoc 注释

### 命名规范

- 文件: kebab-case
- 类: PascalCase
- 函数: camelCase
- 常量: UPPER_SNAKE_CASE

### 提交规范

使用 Conventional Commits：

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 构建与发布

### 本地开发

```bash
cd vscode-extension
npm install
npm run compile
# 按 F5 调试
```

### 打包

```bash
npm run package
```

### 发布

```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包
vsce package

# 发布到市场
vsce publish
```

## 与 CLI 的关系

VS Code 扩展与 CLI 共享核心业务逻辑：

```
┌─────────────────────────────────────┐
│          大圣 Dasheng                │
├─────────────┬─────────────┬─────────┤
│   CLI v1.0  │  TUI v2.0   │ VS Code │
│   石猴出世   │  通背猿猴    │ v3.0    │
├─────────────┴─────────────┴─────────┤
│         核心服务层                    │
│  ├─ YAML 翻译                        │
│  ├─ Markdown 翻译                    │
│  ├─ 封面生成                         │
│  └─ 博客生成                         │
├─────────────────────────────────────┤
│         AI Provider 层               │
│  ├─ OpenAI                          │
│  ├─ Anthropic (计划中)               │
│  └─ Local (计划中)                   │
└─────────────────────────────────────┘
```

## 性能指标

| 功能 | 启动时间 | 内存占用 | 响应时间 |
|------|---------|---------|---------|
| 激活扩展 | < 100ms | < 50MB | - |
| YAML 翻译 | - | < 100MB | < 5s/100keys |
| Markdown 翻译 | - | < 100MB | < 3s/1000字 |
| 封面生成 | - | < 50MB | < 1s |
| 博客生成 | - | < 100MB | < 10s |

## 兼容性

- VS Code: >= 1.85.0
- Node.js: >= 18.0.0
- 操作系统: Windows, macOS, Linux

## 贡献指南

请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 常见问题

### Q: 如何配置 API Key？

A: 推荐方式：
1. 设置环境变量 `DASHENG_API_KEY` 或 `OPENAI_API_KEY`
2. 或在 VS Code 设置中搜索 "dasheng" 进行配置

### Q: 翻译失败怎么办？

A: 检查以下几点：
1. API Key 是否正确
2. 网络连接是否正常
3. API 余额是否充足
4. 查看输出面板中的日志

### Q: 支持哪些 AI 模型？

A: 目前支持：
- OpenAI GPT 系列
- Kimi (通过 baseUrl 配置)
- DeepSeek (通过 baseUrl 配置)

更多模型支持正在开发中。

## 更新日志

请查看 [CHANGELOG.md](../vscode-extension/CHANGELOG.md)

## 许可证

MIT License
