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

## 📥 下载安装

### 方式一：一键安装脚本（推荐）

**Linux / macOS：**
```bash
curl -fsSL https://raw.githubusercontent.com/shuashuai/dasheng/main/scripts/install.sh | bash
```

**Windows (PowerShell)：**
```powershell
irm https://raw.githubusercontent.com/shuashuai/dasheng/main/scripts/install.ps1 | iex
```

### 方式二：直接下载可执行文件

访问 [GitHub Releases](https://github.com/shuashuai/dasheng/releases) 下载对应平台的可执行文件：

| 平台 | 下载 | 大小 |
|------|------|------|
| Windows (x64) | `dasheng-win-x64.zip` | ~50MB |
| Linux (x64) | `dasheng-linux-x64.tar.gz` | ~50MB |
| macOS (Intel) | `dasheng-macos-x64.tar.gz` | ~50MB |
| macOS (Apple Silicon) | `dasheng-macos-arm64.tar.gz` | ~50MB |

**Windows 使用示例：**
```bash
# 解压下载的文件
dasheng-win-x64.exe --help

# 或重命名为 dasheng.exe 使用
dasheng.exe translate-yaml ./en.yaml --target ./locales/
```

**Linux / macOS 使用示例：**
```bash
# 解压
tar -xzf dasheng-linux-x64.tar.gz

# 添加执行权限
chmod +x dasheng-linux-x64

# 使用
./dasheng-linux-x64 --help

# 可选：移动到 PATH 目录
sudo mv dasheng-linux-x64 /usr/local/bin/dasheng
```

### 方式二：通过 npm 安装

```bash
# 使用 pnpm（推荐）
pnpm install -g dasheng

# 或使用 npm
npm install -g dasheng

# 或使用 npx（无需安装）
npx @code_shuai/dasheng --help
```

### 方式三：使用 Docker

```bash
# 拉取镜像
docker pull ghcr.io/shuashuai/dasheng:latest

# 使用容器运行
docker run --rm \
  -v $(pwd):/workdir \
  -w /workdir \
  ghcr.io/shuashuai/dasheng:latest \
  translate-yaml ./en.yaml --target ./locales/
```

### 方式四：从源码构建

```bash
# 克隆仓库
git clone https://github.com/shuashuai/dasheng.git
cd dasheng

# 安装依赖
pnpm install

# 构建
pnpm build

# 运行
node dist/cli/index.js --help
```

## 🔌 VS Code 插件安装

### 从市场安装

1. 打开 VS Code
2. 进入扩展面板 (`Ctrl+Shift+X`)
3. 搜索 "大圣" 或 "Dasheng"
4. 点击安装

### 从源码安装

```bash
cd dasheng/vscode-extension

# 安装依赖
npm install

# 代码检查
npm run lint

# 编译构建
npm run compile

# 按 F5 启动调试模式
```

### 开发验证

```bash
# 一键验证（类型检查 + ESLint + 构建）
npm run compile

# 单独检查
npm run check-types  # TypeScript 类型检查
npm run lint         # ESLint 检查
npm run lint:fix     # 自动修复
npm run format       # 代码格式化
```

### 快捷键

- `Ctrl+Shift+D` - 打开大圣面板
- `Ctrl+Shift+T` - 翻译选中文本

[查看完整文档](./vscode-extension/README.md)

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

#### 🖥️ 方式一：TUI 交互界面（推荐）

```bash
# 启动交互式 TUI 界面
dasheng tui
# 或
dasheng ui
```

TUI 界面提供可视化交互体验：
- 🏠 **首页** - 快速入口导航
- 🌐 **语言通** - YAML 多语言翻译向导
- 📝 **译真经** - Markdown 翻译向导
- 🎨 **画皮术** - 封面生成向导
- ✍️ **妙笔生花** - 博客生成向导

**键盘操作：**
- `← →` / `Tab` - 切换 Tab
- `↑ ↓` - 选择功能或选项
- `Enter` - 确认
- `q` / `Ctrl+C` - 退出

#### ⌨️ 方式二：CLI 命令行

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
- [x] v2.0 通背猿猴 - TUI 交互界面 ✅
- [x] v3.0 六耳猕猴 - VS Code 插件 ✅
- [ ] v4.0 斗战胜佛 - Web 界面

### VS Code 插件功能

🐵 **六耳猕猴** - IDE 化身，现已发布！

- 🌐 **YAML 翻译** - 右键一键翻译，自动同步多语言
- 📝 **Markdown 翻译** - 选中文本即译，保护代码块
- 🎨 **封面生成** - 5种风格，多种比例
- ✍️ **博客生成** - 从 Release Notes 自动生成
- 🖥️ **可视化面板** - Dashboard + 侧边栏双视图

[查看详情](./vscode-extension/README.md) | [安装使用](#vscode-插件安装)

## 📄 License

MIT
