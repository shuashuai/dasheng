#!/bin/bash

# 🧪 大圣 VS Code 扩展测试脚本

set -e

echo "🧪 大圣 VS Code 扩展测试"
echo "=========================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在正确目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在 vscode-extension 目录中运行此脚本${NC}"
    exit 1
fi

echo ""
echo "📦 步骤 1: 安装依赖..."
npm install

echo ""
echo "🔍 步骤 2: TypeScript 类型检查..."
npm run check-types

echo ""
echo "🔍 步骤 3: ESLint 检查..."
npm run lint

echo ""
echo "🔨 步骤 4: 编译源码..."
npm run compile

echo ""
echo "🔨 步骤 5: 编译测试..."
npm run compile-tests

echo ""
echo "🧪 步骤 6: 运行测试..."
echo "⚠️  这将启动 VS Code 测试宿主窗口"
echo ""
read -p "按 Enter 继续..."

npm test

echo ""
echo -e "${GREEN}✅ 所有测试通过!${NC}"
