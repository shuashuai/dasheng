# 🐵 大圣开发指南

## 包管理器：pnpm

本项目使用 **pnpm** 作为包管理工具。

### 为什么用 pnpm？

- 🚀 **快** - 比 npm/yarn 更快的安装速度
- 💾 **省空间** - 全局存储，硬链接复用
- 🧹 **干净** - 严格的依赖管理，无幽灵依赖

### 安装 pnpm

```bash
npm install -g pnpm
```

### 常用命令

```bash
# 安装依赖
pnpm install

# 添加运行时依赖
pnpm add <package>

# 添加开发依赖
pnpm add -D <package>

# 添加全局依赖
pnpm add -g <package>

# 运行脚本
pnpm dev
pnpm build
pnpm test

# 查看依赖树
pnpm list

# 清理依赖
pnpm prune

# 更新依赖
pnpm update

# 检查过期依赖
pnpm outdated
```

### 开发工作流

```bash
# 1. 安装依赖
pnpm install

# 2. 开发模式（热重载）
pnpm dev -- translate-yaml ./test.yaml

# 3. 构建
pnpm build

# 4. 本地测试
pnpm start -- translate-yaml ./test.yaml

# 5. 发布前检查
pnpm lint
pnpm test
```

### 锁定文件

- `pnpm-lock.yaml` - 锁定依赖版本
- **提交到 git** - 确保团队依赖一致

### 故障排除

```bash
# 如果安装失败，尝试清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```
