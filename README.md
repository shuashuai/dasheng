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
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/dasheng/main/scripts/install.sh | bash
```

**Windows (PowerShell)：**
```powershell
irm https://raw.githubusercontent.com/YOUR_USERNAME/dasheng/main/scripts/install.ps1 | iex
```

### 方式二：直接下载可执行文件

访问 [GitHub Releases](https://github.com/YOUR_USERNAME/dasheng/releases) 下载对应平台的可执行文件：

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
docker pull ghcr.io/YOUR_USERNAME/dasheng:latest

# 使用容器运行
docker run --rm \
  -v $(pwd):/workdir \
  -w /workdir \
  ghcr.io/YOUR_USERNAME/dasheng:latest \
  translate-yaml ./en.yaml --target ./locales/
```

### 方式四：从源码构建

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/dasheng.git
cd dasheng

# 安装依赖
pnpm install

# 构建
pnpm build

# 运行
node dist/cli/index.js --help
```

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
