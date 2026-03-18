# Task Plan: Dasheng 第二阶段 TUI 开发

## Goal
为 Dasheng (大圣) CLI 工具开发 TUI (Terminal User Interface) 交互界面，将现有的命令行工具升级为具有可视化交互体验的终端应用，代号"通背猿猴"。

## Current Phase
Phase 5

## Phases

### Phase 1: 需求分析与技术选型 ✅
- [x] 理解现有 CLI 架构和命令结构
- [x] 分析 v1.0 已实现功能（translate-yaml, translate-md, generate-cover, generate-blog）
- [x] 调研 TUI 库选项（Ink 胜出）
- [x] 确定 TUI 架构设计
- [x] 定义交互流程和界面原型
- **Status:** complete

### Phase 2: 基础架构搭建 ✅
- [x] 安装 TUI 依赖库 (ink, react, @inkjs/ui, @types/react)
- [x] 创建 TUI 入口模块 (src/tui/index.tsx)
- [x] 设计组件架构（Tab 导航、Box 布局）
- [x] 实现基础 UI 框架（Header、TabNav、Content、Footer）
- [x] 集成到 CLI (`dasheng tui` 命令)
- [x] 构建通过
- **Status:** complete

### Phase 3: 核心功能迁移 ✅
- [x] 实现首页/仪表盘界面（带快速入口导航）
- [x] 迁移 translate-yaml 功能到 TUI（完整交互式向导）
- [x] 迁移 translate-md 功能到 TUI（完整交互式向导）
- [x] 迁移 generate-cover 功能到 TUI（完整交互式向导）
- [x] 迁移 generate-blog 功能到 TUI（完整交互式向导）
- [ ] 实现配置管理界面（可选）
- **Status:** complete

### Phase 4: 交互优化与增强 ✅
- [x] 实现实时进度显示（Spinner 组件）
- [x] 添加基础 UI 组件（TextInput, Select, Confirm）
- [x] 实现结果展示功能（Result 组件）
- [x] 添加键盘快捷键支持（←→ Tab 切换，↑↓ 选择，Enter 确认，q 退出）
- [ ] 实现文件选择器组件（可用文件路径输入替代）
- [ ] 实现主题切换（亮/暗）
- **Status:** complete

### Phase 5: 测试与文档 ✅
- [x] 编写 TUI 组件测试 (5 个基础组件测试)
- [x] 更新 README 添加 TUI 说明
- [x] 更新用户手册 (USER_GUIDE.md) 添加 TUI 使用指南
- [x] 添加 TUI 使用示例
- [x] 更新版本号到 2.0.0
- **Status:** complete

### Phase 6: 发布准备
- [ ] 更新 package.json 命令
- [ ] 更新 README 文档
- [ ] 打 tag 发布 v2.0.0
- **Status:** pending

## Key Questions (已解答)
1. ✅ 选择哪个 TUI 库？**Ink 4.x + React 18** (组件化, Flexbox, TypeScript 支持好)
2. ✅ TUI 和 CLI 如何共存？**`dasheng tui` 子命令**启动 TUI，保留原有 CLI
3. ✅ 是否需要保留纯 CLI 模式？**是**，脚本调用需要纯 CLI
4. ✅ 如何设计导航结构？**Tab-based** (Dashboard | 语言通 | 译真经 | 画皮术 | 妙笔生花)
5. ✅ 是否需要支持鼠标操作？**优先键盘**，可选鼠标支持

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Ink 4.x + React 18 | 现代组件模型，Flexbox 布局，生态丰富 |
| `dasheng tui` 命令 | 显式启动 TUI，不破坏 CLI 向后兼容 |
| Tab-based 导航 | 5 个主要功能对应 5 个 Tab，结构清晰 |
| @inkjs/ui 组件库 | 现成的输入框、选择器、进度条组件 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| 无 | - | - |

## Notes
- 项目使用 TypeScript + ESM 模块
- 已有依赖：chalk, inquirer, ora, cli-progress（可用于 TUI 样式）
- 现有命令：translate-yaml, translate-md, generate-cover, generate-blog, config
- 需要保持 CLI 向后兼容
