# 🤖 AGENTS.md - 项目开发规范

> 本文件面向 AI Agent 和开发者，说明项目开发规范和提交要求。

## 📋 提交前检查清单

每次提交代码前，**必须**确保以下检查全部通过：

```bash
# 1. 代码格式检查
npm run format:check

# 2. TypeScript 类型检查
npx tsc --noEmit

# 3. ESLint 检查
npm run lint

# 4. 构建测试
npm run build
```

### 自动修复

如果 format 检查失败，可以自动修复：

```bash
npm run format
```

如果 lint 检查失败，可以尝试自动修复：

```bash
npm run lint:fix
```

## 🏗️ 项目结构

```
dasheng/
├── bin/                    # 入口脚本
│   └── dasheng.js         # CLI 入口
├── src/
│   ├── cli/               # CLI 命令
│   │   ├── index.ts       # CLI 入口
│   │   └── commands/      # 各命令实现
│   ├── core/              # 核心逻辑
│   │   ├── providers/     # AI 提供商
│   │   ├── services/      # 业务服务
│   │   └── utils/         # 工具函数
│   ├── tui/               # TUI 界面 (Ink + React)
│   │   ├── components/    # UI 组件
│   │   └── screens/       # 页面屏幕
│   └── types/             # TypeScript 类型
├── dist/                  # 构建输出 (gitignore)
├── scripts/               # 安装脚本
├── docs/                  # 文档
└── i18n/                  # 国际化文件
```

## 📝 开发规范

### 代码风格

- 使用 **Prettier** 进行代码格式化
- 使用 **ESLint** 进行代码检查
- 使用 **TypeScript** 严格模式

### 提交规范

- 使用清晰的提交信息
- 推荐格式: `<type>: <description>`
- 示例: `fix: 修复版本号错误`, `feat: 添加新功能`

### 版本号管理

- 版本号定义在 `package.json` 和 `src/cli/index.ts` 中
- 发布时创建 Git tag 触发自动构建

## 🚀 发布流程

1. 确保所有检查通过
2. 更新版本号
3. 创建 Git tag: `git tag vX.X.X`
4. 推送 tag: `git push origin vX.X.X`
5. GitHub Actions 自动构建并发布

## 🐛 常见问题

### format:check 失败

```bash
# 自动修复
npm run format
```

### 类型检查失败

```bash
# 查看详细错误
npx tsc --noEmit
```

### 构建失败

```bash
# 先清理再构建
rm -rf dist
npm run build
```
