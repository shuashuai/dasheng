# Findings & Decisions - Dasheng TUI 开发

## Requirements
<!-- 从用户请求和产品路线图中提取 -->
- 开发第二阶段 TUI (Terminal User Interface) 交互界面
- 代号："通背猿猴"
- 版本：v2.0.0
- 基于现有 v1.0 CLI 功能进行交互式升级
- 保留所有 v1.0 功能（YAML翻译、MD翻译、封面生成、博客生成）

### 具体功能需求
1. **首页/仪表盘** - 展示大圣 Logo、版本信息、快速入口
2. **语言通 (YAML翻译)** - 文件选择、语言选择、进度展示
3. **译真经 (MD翻译)** - 文件选择、目标语言、输出预览
4. **画皮术 (封面生成)** - 风格选择、比例选择、实时预览
5. **妙笔生花 (博客生成)** - 交互式输入、风格选择、结果预览
6. **配置管理** - 可视化配置 API Key 和参数

## Research Findings

### 现有项目架构
- **技术栈**: TypeScript + ESM + Node.js 18+
- **构建工具**: tsc + tsx (dev)
- **包管理**: pnpm
- **现有 CLI 库**: commander, chalk, inquirer, ora, cli-progress

### 现有命令结构
```
dasheng translate-yaml <file> [options]     # YAML翻译
dasheng translate-md <file> [options]       # MD翻译
dasheng generate-cover [file] [options]     # 封面生成
dasheng generate-blog [file] [options]      # 博客生成
dasheng config [options]                    # 配置管理
```

### TUI 库调研选项

#### 1. Ink (推荐候选)
- **优点**: React-based, 组件化开发, 生态丰富, TypeScript 支持好
- **缺点**: 需要学习 Ink 的组件, 包体积增加 (~100KB+)
- **适用**: 复杂交互界面, 需要状态管理

#### 2. Blessed / Blessed-contrib
- **优点**: 功能强大, 成熟稳定, 支持鼠标
- **缺点**: API 较老, TypeScript 支持一般, 学习曲线陡峭
- **适用**: 传统终端应用

#### 3. React-blessed
- **优点**: React + Blessed 结合
- **缺点**: 维护不活跃, 文档不足

#### 4. 基于现有库增强
- **方案**: inquirer (已有) + chalk (已有) + 自定义菜单
- **优点**: 最小依赖增加, 保持轻量
- **缺点**: 界面效果有限

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 使用 **Ink 4.x + React 18** 构建 TUI | React 组件模型，Flexbox 布局，TypeScript 支持好，生态丰富 |
| 使用 **Pastel** 框架（基于 Ink） | Batteries-included 框架，内置路由、布局、主题 |
| 保留 CLI 向后兼容 | v1.0 用户可能依赖脚本调用，通过 `dasheng tui` 子命令启动 TUI |
| 使用 **ink-ui** 组件库 | 提供 TextInput, Select, Spinner, ProgressBar 等现成组件 |

## TUI 架构设计

### 界面结构
```
┌─────────────────────────────────────────┐
│  🐵 大圣 Dasheng v2.0        [Tab导航]   │  <- Header
├─────────────────────────────────────────┤
│                                         │
│  [Dashboard] [语言通] [译真经] [画皮术]   │  <- Tab 切换
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Main Content Area               │  <- 内容区
│         (根据 Tab 显示不同功能)          │
│                                         │
├─────────────────────────────────────────┤
│  [↑↓] 导航  [Enter] 确认  [q] 退出      │  <- Footer
└─────────────────────────────────────────┘
```

### 技术栈
| 库 | 版本 | 用途 |
|----|------|------|
| ink | ^4.x | React TUI 渲染引擎 |
| react | ^18.x | 组件模型 |
| @inkjs/ui | ^2.x | UI 组件库 |
| pastel | ^1.x | TUI 框架（可选）|

### 命令设计
```bash
# 启动 TUI
dasheng tui
dasheng ui        # 别名

# 原有 CLI 命令保持不变
dasheng translate-yaml <file> [options]
dasheng translate-md <file> [options]
...
```

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| 无 | - |

## Resources
- **项目源码**: `src/cli/index.ts` - CLI 入口
- **命令实现**: `src/cli/commands/` - 各命令实现
- **核心服务**: `src/core/services/` - 业务逻辑
- **TUI 源码**: `src/tui/` - TUI 实现
- **Ink 文档**: https://github.com/vadimdemedes/ink
- **Blessed 文档**: https://github.com/chjj/blessed

## TUI 项目结构
```
src/tui/
├── index.tsx                 # TUI 入口
├── app.tsx                   # 主应用组件 (Tab 导航 + 路由)
├── components/
│   ├── Header.tsx           # 顶部 Logo 栏
│   ├── Footer.tsx           # 底部快捷键提示
│   ├── TabNav.tsx           # Tab 导航组件
│   ├── TextInput.tsx        # 文本输入组件
│   ├── Select.tsx           # 单选列表组件
│   ├── Confirm.tsx          # 确认选择组件
│   ├── Spinner.tsx          # 加载动画组件
│   └── Result.tsx           # 结果显示组件
└── screens/
    ├── DashboardScreen.tsx       # 首页仪表盘 (快速入口)
    ├── TranslateYamlScreen.tsx   # 语言通 (6步向导)
    ├── TranslateMdScreen.tsx     # 译真经 (5步向导)
    ├── GenerateCoverScreen.tsx   # 画皮术 (10步向导)
    └── GenerateBlogScreen.tsx    # 妙笔生花 (9步向导)
```

## TUI 功能特性

### 导航
- **Tab 切换**: ← → 方向键或 Tab 键
- **快速入口**: Dashboard 中 ↑↓ 选择功能，Enter 进入
- **退出**: q 键或 Ctrl+C

### 交互组件
- **TextInput**: 支持文本输入、退格删除、Enter 确认
- **Select**: 支持 ↑↓ 选择、Enter 确认
- **Confirm**: 支持 ←→ 切换 Yes/No、Enter 确认、y/n 快捷键
- **Spinner**: 帧动画加载指示器
- **Result**: 成功/失败结果展示

### 功能向导流程

#### 语言通 (translate-yaml)
1. 选择基础语言文件
2. 输入目标目录
3. 选择目标语言
4. 配置试演模式
5. 配置强制重译
6. 确认并开始
7. 显示结果

#### 译真经 (translate-md)
1. 选择 Markdown 文件
2. 选择目标语言
3. 输入输出路径（可选）
4. 配置 frontMatter 保护
5. 显示结果

#### 画皮术 (generate-cover)
1. 选择内容来源（文件/主题）
2. 输入文件路径或主题
3. 选择设计风格
4. 选择画面比例
5. 输入输出路径（可选）
6. 输入副标题（可选）
7. 输入作者名（可选）
8. 确认配置
9. 生成中
10. 显示结果

#### 妙笔生花 (generate-blog)
1. 选择内容来源（文件/主题）
2. 输入 Release Notes 文件或主题
3. 输入关键要点（可选）
4. 选择博客风格
5. 选择目标读者
6. 输入输出路径（可选）
7. 确认配置
8. 生成中
9. 显示结果

## 遇到的 TypeScript 问题及解决

### 问题 1: JSX namespace 错误 (TS2503)
**错误**: `Cannot find namespace 'JSX'`
**解决**: 
1. 更新 tsconfig.json: `"lib": ["ES2022", "DOM"]`
2. 组件返回类型使用 `React.JSX.Element` 而非 `JSX.Element`

### 问题 2: JSX runtime 错误 (TS2875)
**错误**: `This JSX tag requires the module path 'ink/jsx-runtime'`
**解决**: 
更新 tsconfig.json JSX 配置:
```json
"jsx": "react",
"jsxFactory": "React.createElement",
"jsxFragmentFactory": "React.Fragment"
```

### 问题 3: 类型推断问题 (TS2742)
**错误**: The inferred type cannot be named without a reference
**解决**: 显式声明组件返回类型 `React.JSX.Element`

## Visual/Browser Findings
- 无
