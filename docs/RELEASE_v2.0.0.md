# 🐵 大圣 v2.0.0 - 通背猿猴 发布说明

> **72变无所不能，一棒扫清万难**

## 概览

大圣 v2.0.0 代号"**通背猿猴**"正式发布！本次更新带来了全新的 **TUI (Terminal User Interface)** 交互界面，让 CLI 工具也能拥有可视化操作体验。

---

## ✨ 新特性

### 🖥️ TUI 交互界面

```bash
# 启动交互式界面
dasheng tui
# 或
dasheng ui
```

**界面预览：**

```
┌─────────────────────────────────────────┐
│  🐵 大圣 Dasheng  |  通背猿猴 v2.0      │
├─────────────────────────────────────────┤
│  🏠首页  🌐语言通  📝译真经  🎨画皮术  ✍️妙笔 │
├─────────────────────────────────────────┤
│                                         │
│  ⚡ 快速入口                            │
│  ▶ 🌐 语言通 - YAML 多语言翻译          │
│    📝 译真经 - Markdown 翻译            │
│    🎨 画皮术 - 生成封面图               │
│    ✍️ 妙笔生花 - 生成技术博客            │
│                                         │
├─────────────────────────────────────────┤
│ [Tab/←→] 切换 [Enter] 确认 [q] 退出     │
└─────────────────────────────────────────┘
```

### 🎯 交互式向导

所有功能都支持可视化向导：

| 功能 | 向导步骤 | 特点 |
|------|---------|------|
| 🌐 语言通 | 6 步 | 文件→目录→语言→选项→确认→结果 |
| 📝 译真经 | 5 步 | 文件→语言→输出→frontMatter→结果 |
| 🎨 画皮术 | 10 步 | 完整配置封面风格、比例、副标题等 |
| ✍️ 妙笔生花 | 9 步 | 支持文件/主题双来源，风格选择 |

### ⌨️ 键盘快捷键

| 按键 | 功能 |
|------|------|
| `← →` / `Tab` | 切换 Tab |
| `↑ ↓` | 选择功能或选项 |
| `Enter` | 确认 |
| `y / n` | Yes/No 快速选择 |
| `q` / `Ctrl+C` | 退出 |

---

## 📦 安装

```bash
# npm
npm install -g @code_shuai/dasheng

# pnpm (推荐)
pnpm install -g @code_shuai/dasheng
```

---

## 🚀 快速开始

### TUI 模式（推荐）

```bash
dasheng tui
```

通过交互式界面完成所有操作，无需记忆命令参数。

### CLI 模式（脚本自动化）

```bash
# YAML 翻译
dasheng translate-yaml ./locales/en.yaml --target ./locales/

# Markdown 翻译
dasheng translate-md ./blog/post.md --target-lang zh-CN

# 生成封面
dasheng generate-cover ./blog/post.md --style tech

# 生成博客
dasheng generate-blog ./RELEASE_NOTES.md --style release
```

---

## 🛠️ 技术栈

- **Ink 4.x** - React TUI 渲染引擎
- **React 18** - 组件模型
- **TypeScript** - 类型安全
- **ink-testing-library** - 组件测试

---

## 📁 项目结构

```
src/tui/
├── index.tsx              # TUI 入口
├── app.tsx                # 主应用组件
├── components/            # UI 组件
│   ├── TextInput.tsx     # 文本输入
│   ├── Select.tsx        # 单选列表
│   ├── Confirm.tsx       # 确认选择
│   ├── Spinner.tsx       # 加载动画
│   └── Result.tsx        # 结果显示
└── screens/              # 功能屏幕
    ├── DashboardScreen.tsx
    ├── TranslateYamlScreen.tsx
    ├── TranslateMdScreen.tsx
    ├── GenerateCoverScreen.tsx
    └── GenerateBlogScreen.tsx
```

---

## 📚 文档

- [用户使用手册](./USER_GUIDE.md) - 完整的 TUI 和 CLI 使用指南
- [TUI 本地验证报告](../TUI_VALIDATION.md) - 功能和兼容性验证
- [TUI 手动测试指南](./TUI_MANUAL_TEST.md) - 详细的测试步骤

---

## 🗺️ 路线图

- [x] v1.0 石猴出世 - CLI 工具 ✅
- [x] **v2.0 通背猿猴 - TUI 交互界面 ✅**
- [ ] v3.0 六耳猕猴 - VS Code 插件
- [ ] v4.0 斗战胜佛 - Web 界面

---

## 🙏 致谢

感谢 Ink 团队提供的优秀 TUI 框架！

---

**🐵 大圣 - 72变无所不能，一棒扫清万难！**
