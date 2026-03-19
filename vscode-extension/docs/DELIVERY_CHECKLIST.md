# 📋 交付检查清单

本文档定义了大圣 VS Code 扩展交付前的所有验证步骤。

## ✅ 前置检查

### 环境准备
- [ ] Node.js >= 18.0.0
- [ ] npm >= 9.0.0 或 pnpm >= 8.0.0
- [ ] VS Code >= 1.85.0

### 依赖安装
```bash
cd dasheng/vscode-extension
npm install
```

---

## 🔍 代码质量验证

### 1. TypeScript 类型检查
```bash
npm run check-types
```
**预期结果**: 无错误输出

### 2. ESLint 代码检查
```bash
npm run lint
```
**预期结果**: 无错误输出

### 3. 自动修复（可选）
```bash
npm run lint:fix
```
**预期结果**: 自动修复可修复的问题

### 4. 代码格式化检查
```bash
npm run format:check
```
**预期结果**: 无格式问题

### 5. 代码格式化
```bash
npm run format
```
**预期结果**: 所有文件已格式化

---

## 🔨 构建验证

### 6. 完整编译
```bash
npm run compile
```
**预期结果**: 
- 类型检查通过 ✅
- ESLint 检查通过 ✅
- esbuild 构建成功 ✅
- 生成 dist/extension.js

### 7. 生产构建
```bash
npm run package
```
**预期结果**:
- 生成生产版本
- 无警告或错误

---

## 🧪 功能测试

### 8. 扩展激活测试
```bash
# 在 VS Code 中按 F5 启动调试
# 检查输出面板是否有 "大圣已就绪" 消息
```

### 9. 核心功能测试
- [ ] 打开 Dashboard 面板 (`Ctrl+Shift+D`)
- [ ] 打开侧边栏视图
- [ ] 右键菜单显示正常
- [ ] 状态栏按钮点击正常

### 10. 命令测试
在命令面板 (`Ctrl+Shift+P`) 中测试：
- [ ] `Dasheng: 语言通`
- [ ] `Dasheng: 译真经`
- [ ] `Dasheng: 画皮术`
- [ ] `Dasheng: 妙笔生花`
- [ ] `Dasheng: 打开大圣面板`

---

## 📦 打包验证

### 11. VSIX 打包
```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包
vsce package
```
**预期结果**: 生成 dasheng-vscode-x.x.x.vsix 文件

### 12. 包内容检查
```bash
# 解压检查
unzip -l dasheng-vscode-x.x.x.vsix
```
**必须包含**:
- extension/dist/extension.js
- extension/package.json
- extension/README.md
- extension/CHANGELOG.md

---

## 📝 文档验证

### 13. README 完整性
- [ ] 安装说明
- [ ] 使用指南
- [ ] 快捷键说明
- [ ] 配置选项
- [ ] 故障排除链接

### 14. CHANGELOG 更新
- [ ] 版本号正确
- [ ] 功能列表完整
- [ ] 日期正确

### 15. API 文档
- [ ] 命令列表完整
- [ ] 配置项说明
- [ ] 类型定义

---

## 🚀 发布前检查

### 16. 版本号检查
```bash
# 检查 package.json 中的版本
cat package.json | grep version
```

### 17. Git 状态
```bash
# 确保所有更改已提交
git status
```
**预期结果**: 无未提交的更改

### 18. Git 标签
```bash
# 创建版本标签
git tag -a v3.0.0 -m "Release v3.0.0"
git push origin v3.0.0
```

---

## 📊 质量指标

### 代码覆盖率（如适用）
```bash
npm run test
```
**目标**: 核心功能覆盖率 > 80%

### 代码行数
```bash
find src -name "*.ts" | xargs wc -l
```
**预期**: 合理范围内，无冗余代码

---

## ✅ 最终确认

### 发布 checklist
- [ ] 所有测试通过
- [ ] 文档完整
- [ ] 版本号正确
- [ ] Git 标签已打
- [ ] CHANGELOG 已更新
- [ ] README 已更新
- [ ] CI/CD 配置正确（如适用）

### 发布后验证
- [ ] 从市场安装测试
- [ ] 功能正常运行
- [ ] 无崩溃或错误

---

## 🔧 快速验证脚本

### 使用脚本（推荐）

```bash
# Bash (Linux/macOS/Git Bash)
./scripts/test.sh

# PowerShell (Windows)
.\scripts\test.ps1
```

### 手动验证

```bash
#!/bin/bash
set -e

echo "🔍 开始交付验证..."

echo "📦 安装依赖..."
npm install

echo "🔍 TypeScript 类型检查..."
npm run check-types

echo "🔍 ESLint 检查..."
npm run lint

echo "📝 代码格式化检查..."
npm run format:check

echo "🔨 构建..."
npm run compile

echo "📦 打包..."
npm run package

echo "✅ 所有验证通过！"
```

## 🪝 Git Hooks

项目已配置 Husky，在 git commit 前会自动运行：

```bash
# 提交代码时会自动执行：
# 1. TypeScript 类型检查
# 2. ESLint 代码检查

git add .
git commit -m "feat: add new feature"
# 自动运行验证...
```

手动安装 hooks：
```bash
npm run prepare
```

---

## ❌ 常见问题

### Q: TypeScript 编译失败
**解决**: 
1. 检查 `tsconfig.json` 配置
2. 确保所有依赖已安装
3. 检查类型定义是否完整

### Q: ESLint 报错
**解决**:
1. 运行 `npm run lint:fix` 自动修复
2. 检查 `.eslintrc.json` 配置
3. 手动修复剩余错误

### Q: 构建产物缺失
**解决**:
1. 检查 `esbuild.js` 配置
2. 确保 `out/` 目录可写
3. 检查入口文件路径

---

**验证完成时间**: _______________

**验证人**: _______________

**版本**: _______________
