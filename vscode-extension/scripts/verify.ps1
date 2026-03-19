# 🔍 大圣 VS Code 扩展验证脚本 (PowerShell)

Write-Host "🔍 大圣 VS Code 扩展验证" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

Set-Location $PSScriptRoot\..

Write-Host ""
Write-Host "📦 步骤 1: 安装依赖..."
npm install

Write-Host ""
Write-Host "🔍 步骤 2: TypeScript 类型检查..."
npm run check-types

Write-Host ""
Write-Host "🔍 步骤 3: ESLint 代码检查..."
npm run lint

Write-Host ""
Write-Host "🔨 步骤 4: 编译源码..."
npm run compile

Write-Host ""
Write-Host "🔨 步骤 5: 编译测试..."
npm run compile-tests

Write-Host ""
Write-Host "✅ 所有验证通过！" -ForegroundColor Green
Write-Host ""
Write-Host "注意：完整的集成测试需要在 VS Code 中按 F5 运行" -ForegroundColor Yellow
Write-Host "或在本地运行: npm test" -ForegroundColor Yellow
