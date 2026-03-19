# API 文档

本文档介绍大圣 VS Code 扩展的编程接口，供开发者参考。

## 命令列表

### 核心命令

| 命令 ID | 标题 | 参数 |
|---------|------|------|
| `dasheng.translateYaml` | 🌐 语言通 - 翻译 YAML | - |
| `dasheng.translateYamlQuick` | 🌐 快速翻译 YAML | `uri: vscode.Uri` |
| `dasheng.translateMarkdown` | 📝 译真经 - 翻译 Markdown | - |
| `dasheng.translateMarkdownQuick` | 📝 快速翻译 Markdown | `uri: vscode.Uri` |
| `dasheng.generateCover` | 🎨 画皮术 - 生成封面 | - |
| `dasheng.generateCoverForFile` | 🎨 为当前文件生成封面 | `uri: vscode.Uri` |
| `dasheng.generateBlog` | ✍️ 妙笔生花 - 生成博客 | - |
| `dasheng.translateSelection` | 翻译选中文本 | - |
| `dasheng.openDashboard` | 🏠 打开大圣面板 | - |
| `dasheng.openSettings` | ⚙️ 打开设置 | - |
| `dasheng.refreshSidebar` | 刷新侧边栏 | - |

### 调用示例

```typescript
// 执行 YAML 翻译
await vscode.commands.executeCommand('dasheng.translateYaml');

// 为指定文件生成封面
await vscode.commands.executeCommand('dasheng.generateCoverForFile', fileUri);
```

## 配置项

### 配置命名空间

所有配置项都在 `dasheng` 命名空间下。

### AI 配置

```typescript
interface AIConfig {
  // AI 提供商
  provider: 'openai' | 'anthropic' | 'local';
  
  // API 密钥
  apiKey: string;
  
  // 自定义 API 地址
  baseUrl: string;
  
  // 模型名称
  model: string;
}
```

**配置路径**：
- `dasheng.ai.provider`
- `dasheng.ai.apiKey`
- `dasheng.ai.baseUrl`
- `dasheng.ai.model`

### 翻译配置

```typescript
interface TranslationConfig {
  // 默认目标语言
  defaultTargetLangs: string[];
  
  // 保留格式
  preserveFormat: boolean;
}
```

**配置路径**：
- `dasheng.translation.defaultTargetLangs`
- `dasheng.translation.preserveFormat`

### 封面配置

```typescript
interface CoverConfig {
  // 默认风格
  defaultStyle: 'tech' | 'minimal' | 'gradient' | 'illustration' | 'business';
  
  // 默认比例
  defaultRatio: string;
}
```

**配置路径**：
- `dasheng.cover.defaultStyle`
- `dasheng.cover.defaultRatio`

### 博客配置

```typescript
interface BlogConfig {
  // 默认风格
  defaultStyle: 'release' | 'tutorial' | 'news' | 'deep-dive' | 'story';
}
```

**配置路径**：
- `dasheng.blog.defaultStyle`

### 通用配置

```typescript
interface GeneralConfig {
  // 自动检测变化
  autoDetectChanges: boolean;
  
  // 显示通知
  showNotifications: boolean;
}
```

**配置路径**：
- `dasheng.general.autoDetectChanges`
- `dasheng.general.showNotifications`

### 读取配置示例

```typescript
// 获取完整配置
const config = vscode.workspace.getConfiguration('dasheng');

// 读取特定配置项
const apiKey = config.get<string>('ai.apiKey');
const defaultStyle = config.get<string>('cover.defaultStyle', 'tech');

// 监听配置变化
vscode.workspace.onDidChangeConfiguration(e => {
  if (e.affectsConfiguration('dasheng.ai')) {
    // AI 配置发生变化
  }
});
```

## 视图

### 侧边栏视图

- **ID**: `dasheng.sidebar`
- **位置**: Explorer 侧边栏
- **功能**: 提供快速功能入口

### Dashboard 面板

- **ID**: `dashengDashboard`
- **类型**: WebviewPanel
- **功能**: 可视化功能面板

## 事件

### 文件系统事件

扩展会监听以下文件系统事件：

- YAML 文件创建 (`**/*.yaml`)
- YAML 文件修改 (`**/*.yaml`)

## 快捷键

| 命令 | 快捷键 | Mac |
|------|--------|-----|
| `dasheng.openDashboard` | `Ctrl+Shift+D` | `Cmd+Shift+D` |
| `dasheng.translateSelection` | `Ctrl+Shift+T` | `Cmd+Shift+T` |

## 菜单贡献点

### 资源管理器上下文菜单

```json
{
  "menus": {
    "explorer/context": [
      {
        "command": "dasheng.translateYamlQuick",
        "when": "resourceExtname == .yaml || resourceExtname == .yml",
        "group": "dasheng@1"
      }
    ]
  }
}
```

### 编辑器上下文菜单

```json
{
  "menus": {
    "editor/context": [
      {
        "command": "dasheng.translateSelection",
        "when": "editorHasSelection",
        "group": "dasheng@1"
      }
    ]
  }
}
```

## 类型定义

### TranslateOptions

```typescript
interface TranslateOptions {
  from?: string;      // 源语言（默认 auto）
  to: string;         // 目标语言
  context?: string;   // 翻译语境
}
```

### CompleteOptions

```typescript
interface CompleteOptions {
  temperature?: number;  // 温度参数（默认 0.7）
  maxTokens?: number;    // 最大令牌数（默认 2000）
}
```

## 扩展开发

### 依赖注入

扩展使用构造函数注入模式：

```typescript
class MyCommand {
  constructor(
    private configManager: ConfigManager,
    private aiProvider: AIProvider
  ) {}
}
```

### 错误处理

所有命令都应正确处理错误：

```typescript
try {
  await this.performAction();
} catch (error) {
  Logger.error('操作失败', error as Error);
  vscode.window.showErrorMessage(`操作失败: ${(error as Error).message}`);
}
```

### 进度报告

长时间运行的操作应报告进度：

```typescript
await vscode.window.withProgress({
  location: vscode.ProgressLocation.Notification,
  title: '正在处理...',
  cancellable: true
}, async (progress, token) => {
  progress.report({ increment: 50, message: '处理中...' });
  // 执行操作
});
```
