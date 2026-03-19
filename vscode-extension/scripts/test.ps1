# 🧪 大圣 VS Code 扩展测试脚本 (PowerShell)

Write-Host "🧪 大圣 VS Code 扩展测试" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# 检查是否在正确目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在 vscode-extension 目录中运行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 步骤 1: 安装依赖..."
npm install

Write-Host ""
Write-Host "🔍 步骤 2: TypeScript 类型检查..."
npm run check-types

Write-Host ""
Write-Host "🔍 步骤 3: ESLint 检查..."
npm run lint

Write-Host ""
Write-Host "🔨 步骤 4: 编译源码..."
npm run compile

Write-Host ""
Write-Host "🔨 步骤 5: 编译测试..."
npm run compile-tests

Write-Host ""
Write-Host "🧪 步骤 6: 运行测试..." -ForegroundColor Yellow
Write-Host "⚠️  这将启动 VS Code 测试宿主窗口" -ForegroundColor Yellow
Write-Host ""
Read-Host "按 Enter 继续..."

npm test

Write-Host ""
Write-Host "✅ 所有测试通过!" -ForegroundColor Green
