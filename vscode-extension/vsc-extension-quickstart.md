# VS Code 扩展快速入门

欢迎来到大圣 VS Code 扩展开发！

## 文件结构

```
vscode-extension/
├── src/
│   ├── extension.ts          # 扩展入口
│   ├── commands/             # 命令实现
│   ├── providers/            # 视图提供器
│   └── utils/                # 工具类
├── package.json              # 扩展清单
├── tsconfig.json             # TypeScript 配置
└── esbuild.js                # 构建脚本
```

## 开发流程

### 1. 安装依赖

```bash
npm install
```

### 2. 启动调试

按 `F5` 打开扩展开发宿主窗口。

### 3. 测试命令

- 按 `Ctrl+Shift+P` 打开命令面板
- 输入 `Dasheng` 查看所有命令

### 4. 查看面板

- 点击左侧边栏的 🐵 图标打开大圣侧边栏
- 按 `Ctrl+Shift+D` 打开 Dashboard 面板

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run compile` | 编译扩展 |
| `npm run watch` | 监听变更 |
| `npm run package` | 打包扩展 |
| `npm run lint` | 运行 ESLint |

## 调试技巧

1. 在源码中设置断点
2. 使用调试控制台查看变量
3. 查看输出面板中的日志

## 打包发布

```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包
vsce package

# 发布
vsce publish
```

## 了解更多

- [VS Code API 文档](https://code.visualstudio.com/api/references/vscode-api)
- [扩展开发指南](https://code.visualstudio.com/api/extension-guides/overview)
- [Webview 指南](https://code.visualstudio.com/api/extension-guides/webview)
