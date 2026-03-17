#!/bin/bash

# 🐵 大圣 CLI - 一键安装脚本
# 支持: Linux, macOS
# 使用方法: curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/dasheng/main/scripts/install.sh | bash

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REPO="YOUR_USERNAME/dasheng"
INSTALL_DIR="/usr/local/bin"
BINARY_NAME="dasheng"

# 检测系统
detect_platform() {
    local platform
    local arch
    
    platform=$(uname -s | tr '[:upper:]' '[:lower:]')
    arch=$(uname -m)
    
    case "$platform" in
        linux)
            platform="linux"
            ;;
        darwin)
            platform="macos"
            ;;
        *)
            echo -e "${RED}❌ 不支持的操作系统: $platform${NC}"
            exit 1
            ;;
    esac
    
    case "$arch" in
        x86_64|amd64)
            arch="x64"
            ;;
        arm64|aarch64)
            arch="arm64"
            ;;
        *)
            echo -e "${RED}❌ 不支持的架构: $arch${NC}"
            exit 1
            ;;
    esac
    
    echo "${platform}-${arch}"
}

# 获取最新版本
get_latest_version() {
    curl -s "https://api.github.com/repos/${REPO}/releases/latest" | 
    grep '"tag_name":' | 
    sed -E 's/.*"([^"]+)".*/\1/'
}

# 下载并安装
download_and_install() {
    local platform=$1
    local version=$2
    local download_url="https://github.com/${REPO}/releases/download/${version}/dasheng-${platform}.tar.gz"
    local temp_dir=$(mktemp -d)
    
    echo -e "${BLUE}📥 正在下载 ${BINARY_NAME} ${version} (${platform})...${NC}"
    
    if ! curl -L -o "${temp_dir}/${BINARY_NAME}.tar.gz" "$download_url"; then
        echo -e "${RED}❌ 下载失败${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📦 正在解压...${NC}"
    tar -xzf "${temp_dir}/${BINARY_NAME}.tar.gz" -C "$temp_dir"
    
    echo -e "${BLUE}🚀 正在安装到 ${INSTALL_DIR}...${NC}"
    if [ -w "$INSTALL_DIR" ]; then
        mv "${temp_dir}/dasheng-${platform}" "${INSTALL_DIR}/${BINARY_NAME}"
        chmod +x "${INSTALL_DIR}/${BINARY_NAME}"
    else
        echo -e "${YELLOW}⚠️  需要 sudo 权限来安装到 ${INSTALL_DIR}${NC}"
        sudo mv "${temp_dir}/dasheng-${platform}" "${INSTALL_DIR}/${BINARY_NAME}"
        sudo chmod +x "${INSTALL_DIR}/${BINARY_NAME}"
    fi
    
    # 清理临时文件
    rm -rf "$temp_dir"
    
    echo -e "${GREEN}✅ ${BINARY_NAME} ${version} 安装成功！${NC}"
}

# 验证安装
verify_installation() {
    if command -v "$BINARY_NAME" &> /dev/null; then
        echo -e "${GREEN}✅ ${BINARY_NAME} 已安装在: $(which $BINARY_NAME)${NC}"
        echo -e "${BLUE}📋 版本信息:${NC}"
        "$BINARY_NAME" --version
    else
        echo -e "${RED}❌ 安装验证失败，请检查 ${INSTALL_DIR} 是否在 PATH 中${NC}"
        exit 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "   ____            _               "
    echo "  / ___| __ _ _ __| | _____  ___ "
    echo " | |  _ / _  | '__| |/ / _ \/ __|"
    echo " | |_| | (_| | |  |   <  __/\__ \\"
    echo "  \\____|\\__,_|_|  |_|\\_\\___||___/"
    echo -e "${NC}"
    echo -e "${BLUE}  🐵 大圣 CLI - 一键安装脚本${NC}"
    echo ""
    
    # 检测平台
    PLATFORM=$(detect_platform)
    echo -e "${BLUE}🔍 检测到平台: ${PLATFORM}${NC}"
    
    # 获取最新版本
    echo -e "${BLUE}🔍 正在获取最新版本...${NC}"
    VERSION=$(get_latest_version)
    
    if [ -z "$VERSION" ]; then
        echo -e "${RED}❌ 无法获取最新版本信息${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📌 最新版本: ${VERSION}${NC}"
    
    # 下载并安装
    download_and_install "$PLATFORM" "$VERSION"
    
    # 验证安装
    verify_installation
    
    echo ""
    echo -e "${GREEN}🎉 安装完成！使用 'dasheng --help' 开始探索。${NC}"
    echo ""
    echo -e "${BLUE}📖 文档: https://github.com/${REPO}/blob/main/docs/USER_GUIDE.md${NC}"
}

# 运行主函数
main
