#!/bin/bash

# 🔍 大圣 VS Code 扩展验证脚本（不启动 VS Code）

set -e

echo "🔍 大圣 VS Code 扩展验证"
echo "=========================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")/.."

echo ""
echo "📦 步骤 1: 安装依赖..."
npm install

echo ""
echo "🔍 步骤 2: TypeScript 类型检查..."
npm run check-types

echo ""
echo "🔍 步骤 3: ESLint 代码检查..."
npm run lint

echo ""
echo "🔨 步骤 4: 编译源码..."
npm run compile

echo ""
echo "🔨 步骤 5: 编译测试..."
npm run compile-tests

echo ""
echo "✅ 所有验证通过！"
echo ""
echo -e "${YELLOW}注意：完整的集成测试需要在 VS Code 中按 F5 运行${NC}"
echo -e "${YELLOW}或在本地运行: npm test${NC}"
