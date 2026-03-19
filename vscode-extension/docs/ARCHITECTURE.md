# 架构文档

本文档介绍大圣 VS Code 扩展的架构设计。

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Extension.ts                       │  │
│  │                  (入口/生命周期)                       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│         ┌─────────────┼─────────────┐                      │
│         │             │             │                      │
│         ▼             ▼             ▼                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Commands │  │Providers │  │  Utils   │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │             │             │                        │
│       ▼             ▼             ▼                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   AI     │  │ Webview  │  │  Config  │                 │
│  │ Provider │  │  Render  │  │ Manager  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              VS Code API (vscode module)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│              (OpenAI / Kimi / DeepSeek API)                  │
└─────────────────────────────────────────────────────────────┘
```

## 模块说明

### Extension.ts

扩展的入口文件，负责：

- 激活时初始化所有组件
- 注册命令和提供器
- 管理生命周期
- 协调各模块

```typescript
export function activate(context: vscode.ExtensionContext) {
  // 1. 初始化工具
  const configManager = new ConfigManager();
  const logger = new Logger();
  
  // 2. 注册视图提供器
  const sidebarProvider = new DashengSidebarProvider();
  
  // 3. 注册命令
  registerCommands(context, configManager);
  
  // 4. 注册文件监视器
  registerFileWatchers(context, configManager);
}
```

### Commands

每个功能对应一个命令类：

```
commands/
├── yamlTranslate.ts      # YAML 翻译逻辑
├── markdownTranslate.ts  # Markdown 翻译逻辑
├── coverGenerate.ts      # 封面生成逻辑
├── blogGenerate.ts       # 博客生成逻辑
└── translationHelper.ts  # 辅助功能
```

设计原则：
- 每个命令类独立负责一个功能
- 通过构造函数注入依赖
- 使用异步方法处理 I/O
- 统一错误处理

### Providers

视图提供器负责渲染 UI：

```
providers/
├── sidebarProvider.ts    # 侧边栏 WebviewView
└── dashboardProvider.ts  # Dashboard WebviewPanel
```

特点：
- 使用 Webview 技术
- HTML/CSS/JS 内联
- 通过消息与扩展通信
- 响应式设计

### Utils

工具类封装通用功能：

```
utils/
├── config.ts        # 配置管理
├── logger.ts        # 日志输出
└── aiProvider.ts    # AI 服务封装
```

## 数据流

### 命令执行流程

```
用户操作
    │
    ▼
┌─────────────┐
│  Command    │◄── 检查配置
│   Class     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI Provider│◄── 调用 API
│             │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   VS Code   │◄── 显示结果
│     API     │
└─────────────┘
```

### 配置读取流程

```
VS Code
Settings
    │
    ▼
┌─────────────┐
│   Config    │◄── 缓存配置
│   Manager   │
└──────┬──────┘
       │
       ├──► Commands
       ├──► Providers
       └──► AI Provider
```

## 关键设计决策

### 1. 依赖注入

使用构造函数注入，便于测试和解耦：

```typescript
class YamlTranslateCommand {
  constructor(
    private configManager: ConfigManager,
    private aiProvider: AIProvider
  ) {}
}
```

### 2. 配置管理

统一配置管理，支持多层级：

- 默认配置
- 用户配置
- 工作区配置
- 环境变量

优先级：环境变量 > 工作区配置 > 用户配置 > 默认配置

### 3. AI Provider 抽象

支持多种 AI 服务：

```typescript
interface AIProvider {
  translate(text: string, options: TranslateOptions): Promise<string>;
  complete(prompt: string, options?: CompleteOptions): Promise<string>;
}
```

实现类：
- `OpenAIProvider` - OpenAI 兼容 API
- `MockProvider` - 测试用

### 4. 错误处理

统一的错误处理策略：

```typescript
try {
  await operation();
} catch (error) {
  Logger.error('操作失败', error);
  vscode.window.showErrorMessage(`失败: ${error.message}`);
}
```

### 5. 进度报告

长时间操作显示进度：

```typescript
await vscode.window.withProgress({
  location: vscode.ProgressLocation.Notification,
  cancellable: true
}, async (progress, token) => {
  progress.report({ increment: 50 });
});
```

## 扩展点

### 添加新的 AI Provider

1. 实现 `AIProvider` 接口
2. 在工厂函数中注册
3. 更新配置选项

### 添加新的命令

1. 创建命令类
2. 在 extension.ts 注册
3. 更新 package.json

### 添加新的视图

1. 创建 Provider 类
2. 实现 `WebviewViewProvider` 或 `WebviewPanel`
3. 注册到 extension.ts

## 性能考虑

### 1. 懒加载

命令使用动态导入，减少启动时间：

```typescript
program
  .command('translate-yaml')
  .action(async () => {
    const { translateYamlCommand } = await import('./commands/translate-yaml');
    await translateYamlCommand();
  });
```

### 2. 缓存

配置和 AI Provider 实例缓存：

```typescript
private aiProvider: AIProvider | null = null;

getAIProvider(): AIProvider {
  if (!this.aiProvider) {
    this.aiProvider = createAIProvider(this.config);
  }
  return this.aiProvider;
}
```

### 3. 批量处理

AI 请求批量发送：

```typescript
async translateBatch(texts: string[], options: TranslateOptions): Promise<string[]> {
  const batchSize = 20;
  const results: string[] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(text => this.translate(text, options))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

## 安全考虑

### 1. API Key 存储

- 优先使用环境变量
- 配置项标记为敏感
- 不在日志中输出

### 2. 输入验证

- 验证文件路径
- 限制文件大小
- 检查文件类型

### 3. 错误信息

- 不暴露敏感信息
- 友好的错误提示
- 详细的日志记录

## 测试策略

### 单元测试

测试独立的功能单元：

```typescript
describe('ConfigManager', () => {
  it('应该正确读取配置', () => {
    // ...
  });
});
```

### 集成测试

测试完整的命令流程：

```typescript
describe('YamlTranslateCommand', () => {
  it('应该成功翻译 YAML', async () => {
    // ...
  });
});
```

### E2E 测试

测试用户交互场景：

```typescript
describe('Extension', () => {
  it('应该正确激活', async () => {
    // ...
  });
});
```
