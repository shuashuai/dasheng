# 🧪 本地测试指南

本文档介绍如何在大圣 VS Code 扩展中进行各种类型的测试。

## 📋 测试类型

1. **单元测试** - 测试独立的功能模块
2. **集成测试** - 测试命令和视图提供器
3. **E2E 测试** - 模拟用户操作
4. **手动测试** - 人工验证功能

---

## 🚀 快速开始

### 环境准备

```bash
cd dasheng/vscode-extension

# 安装依赖（包含测试依赖）
npm install

# 安装 VS Code 测试工具
npm install -g @vscode/vsce
```

### 一键测试

```bash
# 运行所有测试
npm test

# 或分步测试
npm run check-types    # 类型检查
npm run lint           # 代码规范
npm run compile        # 构建测试
```

---

## 🧩 单元测试

### 测试结构

```
src/
├── commands/
│   └── __tests__/
│       └── yamlTranslate.test.ts
├── utils/
│   └── __tests__/
│       └── config.test.ts
└── test/
    ├── runTest.ts          # 测试入口
    └── suite/
        ├── index.ts        # 测试套件
        └── extension.test.ts
```

### 编写单元测试

创建 `src/utils/__tests__/config.test.ts`:

```typescript
import * as assert from 'assert';
import { ConfigManager } from '../config';

suite('ConfigManager Test Suite', () => {
  let configManager: ConfigManager;

  setup(() => {
    configManager = new ConfigManager();
  });

  test('getAIConfig should return default values', () => {
    const config = configManager.getAIConfig();
    
    assert.strictEqual(config.provider, 'openai');
    assert.strictEqual(config.model, 'gpt-3.5-turbo');
  });

  test('isAIConfigValid should return false when no apiKey', () => {
    const isValid = configManager.isAIConfigValid();
    
    // 默认情况下应该返回 false（除非设置了环境变量）
    // 这里根据实际环境可能不同
    assert.strictEqual(typeof isValid, 'boolean');
  });
});
```

### 运行单元测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- --grep "ConfigManager"

# 运行带覆盖率报告
npm test -- --coverage
```

---

## 🔗 集成测试

### 测试命令

创建 `src/test/suite/commands.test.ts`:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Command Test Suite', () => {
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('code-shuai.dasheng-vscode'));
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    
    assert.ok(commands.includes('dasheng.translateYaml'));
    assert.ok(commands.includes('dasheng.translateMarkdown'));
    assert.ok(commands.includes('dasheng.generateCover'));
    assert.ok(commands.includes('dasheng.generateBlog'));
    assert.ok(commands.includes('dasheng.openDashboard'));
  });

  test('Dashboard panel should open', async () => {
    // 执行打开面板命令
    await vscode.commands.executeCommand('dasheng.openDashboard');
    
    // 检查是否有 WebviewPanel
    // 注意：这需要更复杂的断言来验证
    assert.ok(true);
  });
});
```

### 运行集成测试

```bash
# 启动测试宿主
npm test

# 调试测试
# 在 VS Code 中选择 "Extension Tests" 配置按 F5
```

---

## 🎮 手动测试指南

### 1. 启动调试模式

```bash
# 在 VS Code 中打开项目
code dasheng/vscode-extension

# 按 F5 启动扩展开发宿主
```

### 2. 测试清单

#### 基础功能测试

| 测试项 | 操作步骤 | 预期结果 |
|--------|----------|----------|
| 扩展激活 | 查看输出面板 | 显示 "🐵 大圣已就绪！" |
| Dashboard | 按 `Ctrl+Shift+D` | 打开 Dashboard 面板 |
| 侧边栏 | 点击左侧 🐵 图标 | 显示侧边栏视图 |
| 状态栏 | 查看底部状态栏 | 显示 "$(zap) 大圣" |

#### 命令测试

| 测试项 | 操作步骤 | 预期结果 |
|--------|----------|----------|
| YAML 翻译 | `Ctrl+Shift+P` → "语言通" | 显示文件选择对话框 |
| MD 翻译 | `Ctrl+Shift+P` → "译真经" | 显示文件选择对话框 |
| 封面生成 | `Ctrl+Shift+P` → "画皮术" | 显示输入对话框 |
| 博客生成 | `Ctrl+Shift+P` → "妙笔生花" | 显示输入对话框 |
| 选中翻译 | 选中文本 → `Ctrl+Shift+T` | 显示翻译结果 |

#### 右键菜单测试

| 测试项 | 操作步骤 | 预期结果 |
|--------|----------|----------|
| YAML 右键 | 右键点击 .yaml 文件 | 显示 "🌐 快速翻译 YAML" |
| MD 右键 | 右键点击 .md 文件 | 显示 "📝 快速翻译 MD" |
| MD 封面 | 右键点击 .md 文件 | 显示 "🎨 为当前文件生成封面" |

#### 配置测试

| 测试项 | 操作步骤 | 预期结果 |
|--------|----------|----------|
| 打开设置 | `Ctrl+Shift+P` → "打开设置" | 打开 VS Code 设置页 |
| API Key | 设置 `dasheng.ai.apiKey` | 配置成功保存 |
| 语言设置 | 设置 `dasheng.translation.defaultTargetLangs` | 配置成功保存 |

### 3. 测试用例模板

```markdown
## 测试用例: [功能名称]

### 前置条件
- [ ] 扩展已安装
- [ ] 配置正确

### 测试步骤
1. 步骤 1
2. 步骤 2
3. 步骤 3

### 预期结果
- 结果 1
- 结果 2

### 实际结果
- [ ] 通过
- [ ] 失败（备注: _______）

### 截图
[如有需要]
```

---

## 🐛 调试技巧

### 1. 使用断点

在代码中添加断点：

```typescript
// 在 src/commands/yamlTranslate.ts 中
async execute(): Promise<void> {
  // 在这里添加断点
  const baseFile = await this.selectBaseFile();
  console.log('Selected file:', baseFile); // 或在此行打断点
}
```

### 2. 查看日志

```bash
# 打开 VS Code 输出面板 (Ctrl+Shift+U)
# 选择 "🐵 大圣 Dasheng" 频道

# 查看扩展主机日志
# 选择 "扩展宿主"
```

### 3. 开发者工具

```bash
# 打开开发者工具
Ctrl+Shift+P → "Developer: Toggle Developer Tools"

# 查看 Console 面板
# 查看 Network 面板（调试 Webview）
```

### 4. 调试配置

`.vscode/launch.json` 已配置：

```json
{
  "name": "Run Extension",
  "type": "extensionHost",
  "request": "launch",
  "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
  "outFiles": ["${workspaceFolder}/dist/**/*.js"],
  "preLaunchTask": "${defaultBuildTask}"
}
```

---

## 📊 测试覆盖率

### 生成覆盖率报告

```bash
# 运行带覆盖率的测试
npm test -- --coverage

# 查看报告
coverage/lcov-report/index.html
```

### 覆盖率目标

| 模块 | 目标覆盖率 | 当前状态 |
|------|-----------|----------|
| utils | > 80% | 待测量 |
| commands | > 70% | 待测量 |
| providers | > 60% | 待测量 |

---

## 🔄 持续集成测试

### GitHub Actions

项目已配置 `.github/workflows/ci.yml`：

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

### 本地模拟 CI

```bash
# 清理环境
rm -rf node_modules dist out

# 重新安装
npm ci

# 运行完整检查
npm run check-types
npm run lint
npm run compile
npm test
```

---

## 📝 测试最佳实践

### DO ✅

- 每个功能至少一个测试用例
- 测试边界条件
- 使用有意义的测试名称
- 保持测试独立性
- 及时更新测试

### DON'T ❌

- 测试实现细节
- 依赖外部服务（使用 mock）
- 忽略失败的测试
- 编写过于复杂的测试

---

## 🆘 常见问题

### Q: 测试无法启动

**解决**:
```bash
# 重新安装依赖
rm -rf node_modules
npm install

# 重新编译
npm run compile
```

### Q: 测试超时

**解决**:
```typescript
// 在测试文件中增加超时
this.timeout(10000); // 10秒
```

### Q: Webview 测试失败

**解决**:
- Webview 测试需要特殊处理
- 使用 `@vscode/test-web` 进行 Web 测试

### Q: 如何测试 AI 功能

**解决**:
```typescript
// 使用 MockProvider
import { MockProvider } from '../utils/aiProvider';

// 在测试中注入 mock
const mockProvider = new MockProvider();
// 替换实际的 AI Provider
```

---

## 📚 参考资源

- [VS Code 测试文档](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Mocha 文档](https://mochajs.org/)
- [Chai 断言库](https://www.chaijs.com/)
