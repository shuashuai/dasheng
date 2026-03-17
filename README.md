# 🐵 大圣 (Dasheng)

> **72变无所不能，一棒扫清万难**
> 
> 超越贾维斯的中国智造 AI 助手

大圣是一个命令行工具，帮助开发者高效完成：
- 🌐 **YAML 多语言翻译** - 自动同步国际化文件
- 📝 **Markdown 智能翻译** - 保护 frontMatter，只译正文
- 🎨 **博客封面生成** - 5种风格一键生成
- ✍️ **技术博客写作** - Release Notes 自动生成博客

## 📖 文档

- [用户使用手册](./docs/USER_GUIDE.md) - 完整的使用指南
- [API 文档](./docs/API.md) - 开发接口文档（待完善）

## 📦 安装

```bash
# 使用 pnpm（推荐）
pnpm install -g dasheng

# 或使用 npm
npm install -g dasheng
```

## 🚀 快速开始

### 开发环境（使用 pnpm）

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm dev -- --help

# 构建
pnpm build

# 本地测试
pnpm start -- --help
```

### 1. 配置 API Key

```bash
# 创建配置文件
mkdir ~/.dasheng
echo '{"ai":{"provider":"openai","apiKey":"your-key"}}' > ~/.dashengrc.json
```

### 2. 使用神通

```bash
# 🌐 语言通 - YAML 翻译
dasheng translate-yaml ./locales/en.yaml --target ./locales/

# 📝 译真经 - MD 翻译
dasheng translate-md ./blog/post.md --target-lang zh-CN

# 🎨 画皮术 - 生成封面
dasheng generate-cover ./blog/post.md --style tech --ratio 16:9

# ✍️ 妙笔生花 - 生成博客
dasheng generate-blog ./RELEASE_NOTES.md --style release
```

## 📖 文档

- [产品规范](./docs/spec.md)
- [技术计划](./docs/plan.md)
- [开发任务](./docs/tasks.md)

## 🗺️ 路线图

- [x] v1.0 石猴出世 - CLI 工具 ✅
- [ ] v2.0 通背猿猴 - TUI 交互界面
- [ ] v3.0 六耳猕猴 - VS Code 插件
- [ ] v4.0 斗战胜佛 - Web 界面

## 📄 License

MIT
