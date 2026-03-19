# 贡献指南

感谢您对大圣 VS Code 扩展的兴趣！本文档将帮助您开始贡献代码。

## 开发环境

### 前置要求

- [Node.js](https://nodejs.org/) >= 18.0.0
- [VS Code](https://code.visualstudio.com/) >= 1.85.0
- [Git](https://git-scm.com/)

### 设置开发环境

```bash
# 克隆仓库
git clone https://github.com/shuashuai/dasheng.git
cd dasheng/vscode-extension

# 安装依赖
npm install

# 打开 VS Code
code .
```

## 开发流程

### 1. 启动调试

按 `F5` 打开扩展开发宿主窗口。这将：
- 编译扩展
- 在新的 VS Code 窗口中加载扩展
- 启动调试器

### 2. 进行修改

在 `src/` 目录下进行代码修改。修改会自动重新编译。

### 3. 测试更改

在扩展开发宿主窗口中测试您的更改：
- 测试命令是否正常工作
- 检查 Webview 是否正确渲染
- 验证配置是否正确读取

### 4. 调试

使用 VS Code 的调试功能：
- 在源码中设置断点
- 查看变量和调用堆栈
- 使用调试控制台

## 项目结构

```
src/
├── commands/           # 命令实现
│   ├── yamlTranslate.ts        # YAML 翻译命令
│   ├── markdownTranslate.ts    # Markdown 翻译命令
│   ├── coverGenerate.ts        # 封面生成命令
│   ├── blogGenerate.ts         # 博客生成命令
│   └── translationHelper.ts    # 翻译辅助功能
├── providers/          # 视图提供器
│   ├── sidebarProvider.ts      # 侧边栏视图
│   └── dashboardProvider.ts    # Dashboard 面板
├── utils/              # 工具类
│   ├── config.ts               # 配置管理
│   ├── logger.ts               # 日志工具
│   └── aiProvider.ts           # AI 服务封装
├── extension.ts        # 扩展入口
└── test/               # 测试文件
```

## 编码规范

### TypeScript

- 使用严格的 TypeScript 配置
- 所有函数和类都要有类型注解
- 避免使用 `any` 类型

```typescript
// ✅ 好的示例
async function translate(text: string, options: TranslateOptions): Promise<string> {
  // ...
}

// ❌ 避免的示例
async function translate(text, options) {
  // ...
}
```

### 命名规范

- **文件**：使用 kebab-case（如 `yaml-translate.ts`）
- **类**：使用 PascalCase（如 `YamlTranslateCommand`）
- **函数**：使用 camelCase（如 `performTranslation`）
- **常量**：使用 UPPER_SNAKE_CASE

### 注释

- 所有公共 API 都要有 JSDoc 注释
- 复杂的逻辑需要行内注释

```typescript
/**
 * 执行 YAML 文件翻译
 * @param baseFile 源文件路径
 * @param targetDir 目标目录
 * @param targetLangs 目标语言列表
 * @returns 翻译结果数组
 */
async function translate(
  baseFile: string,
  targetDir: string,
  targetLangs: string[]
): Promise<TranslateResult[]> {
  // ...
}
```

## 提交前验证

### 自动验证（Git Hooks）

项目已配置 Husky，在提交代码前会自动运行：

```bash
git add .
git commit -m "your message"
# 自动运行类型检查和 ESLint
```

### 手动验证

在提交代码前，**必须**运行以下验证：

```bash
# 1. 类型检查
npm run check-types

# 2. ESLint 检查
npm run lint

# 3. 自动修复
npm run lint:fix

# 4. 格式化代码
npm run format

# 5. 完整编译
npm run compile
```

**一键验证**:
```bash
npm run compile
```

⚠️ **注意**: 如果编译失败，PR 将不会被合并。

### CI/CD 验证

所有 Pull Request 都会触发 GitHub Actions 验证：
- TypeScript 类型检查
- ESLint 代码检查
- 构建打包

查看 `.github/workflows/ci.yml` 了解详情。

## 添加新命令

### 1. 创建命令文件

在 `src/commands/` 目录下创建新文件：

```typescript
// src/commands/myCommand.ts
import * as vscode from 'vscode';
import { ConfigManager } from '../utils/config';

export class MyCommand {
  constructor(private configManager: ConfigManager) {}

  async execute(): Promise<void> {
    // 实现命令逻辑
  }
}
```

### 2. 注册命令

在 `extension.ts` 中注册：

```typescript
import { MyCommand } from './commands/myCommand';

// ...
const myCommand = new MyCommand(configManager);

context.subscriptions.push(
  vscode.commands.registerCommand('dasheng.myCommand', () => {
    myCommand.execute();
  })
);
```

### 3. 更新 package.json

添加命令定义：

```json
{
  "contributes": {
    "commands": [
      {
        "command": "dasheng.myCommand",
        "title": "我的命令",
        "category": "大圣"
      }
    ]
  }
}
```

## 添加新配置

### 1. 更新 ConfigManager

在 `src/utils/config.ts` 中添加类型定义：

```typescript
export interface MyConfig {
  enabled: boolean;
  option: string;
}

// ...
getMyConfig(): MyConfig {
  return {
    enabled: this.get('my.enabled', true),
    option: this.get('my.option', 'default')
  };
}
```

### 2. 更新 package.json

```json
{
  "contributes": {
    "configuration": {
      "properties": {
        "dasheng.my.enabled": {
          "type": "boolean",
          "default": true,
          "description": "启用功能"
        },
        "dasheng.my.option": {
          "type": "string",
          "default": "default",
          "description": "选项"
        }
      }
    }
  }
}
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "YAML"
```

### 编写测试

```typescript
// src/test/suite/myCommand.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('MyCommand Test Suite', () => {
  test('应该成功执行命令', async () => {
    const result = await vscode.commands.executeCommand('dasheng.myCommand');
    assert.ok(result);
  });
});
```

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### 示例

```
feat(yaml-translate): 添加批量翻译功能

- 支持同时翻译多个文件
- 添加进度条显示
- 优化内存使用

Closes #123
```

## 发布流程

### 版本号规则

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- `MAJOR`: 不兼容的 API 变更
- `MINOR`: 向后兼容的功能添加
- `PATCH`: 向后兼容的问题修复

### 发布步骤

1. 更新 `CHANGELOG.md`
2. 更新 `package.json` 中的版本号
3. 创建 Git tag
4. 打包扩展
5. 发布到市场

```bash
# 打包
vsce package

# 发布
vsce publish
```

## 获取帮助

- 查看 [GitHub Issues](https://github.com/shuashuai/dasheng/issues)
- 加入讨论 [GitHub Discussions](https://github.com/shuashuai/dasheng/discussions)

## 许可证

通过提交代码，您同意将其授权给项目使用（MIT 许可证）。
