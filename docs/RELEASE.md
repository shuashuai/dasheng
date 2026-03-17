# 🚀 发布流程

本文档说明如何使用 GitHub Actions 自动构建和发布大圣 CLI。

## 📋 发布前检查清单

- [ ] 所有测试通过
- [ ] 版本号已更新（package.json）
- [ ] CHANGELOG.md 已更新
- [ ] 文档已更新

## 🎯 发布方式

### 方式一：自动发布（推荐）

推送 tag 触发自动发布：

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 推送 tag
git push --follow-tags
```

GitHub Actions 会自动：
1. 运行测试
2. 构建多平台可执行文件
3. 创建 GitHub Release
4. 上传到 npm（如果配置了 NPM_TOKEN）

### 方式二：手动发布

1. 进入 GitHub 仓库 → Actions → "Manual Release"
2. 点击 "Run workflow"
3. 输入版本号（如 `v1.0.0`）
4. 选择是否为草稿版本
5. 点击运行

## 📦 构建产物

发布完成后，用户可以从以下渠道获取：

| 渠道 | 链接 | 说明 |
|------|------|------|
| GitHub Releases | `https://github.com/USER/REPO/releases` | 可执行文件下载 |
| npm | `npm install -g dasheng` | Node.js 包 |
| Docker Hub | `docker pull ghcr.io/USER/dasheng` | 容器镜像 |
| 一键安装 | `curl -fsSL .../install.sh \| bash` | 快速安装 |

## 🔧 配置 Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

| Secret | 说明 | 必需 |
|--------|------|------|
| `NPM_TOKEN` | npm 发布令牌 | 可选（自动发布到 npm） |

### 获取 NPM_TOKEN

1. 访问 https://www.npmjs.com/settings/tokens
2. 创建 "Automation" 类型的 token
3. 复制 token 添加到 GitHub Secrets

## 🐳 Docker 镜像

自动构建的镜像标签：

| 标签 | 说明 |
|------|------|
| `latest` | 最新稳定版 |
| `v1.0.0` | 特定版本 |
| `main` | 最新开发版 |

使用示例：
```bash
docker run --rm ghcr.io/YOUR_USERNAME/dasheng:latest --help
```

## 📝 发布后的检查

1. 检查 GitHub Releases 是否创建成功
2. 验证可执行文件是否能正常下载运行
3. 检查 npm 包是否更新（如果启用了 npm 发布）
4. 验证 Docker 镜像是否可拉取

## 🆘 故障排除

### 构建失败

检查 GitHub Actions 日志，常见问题：
- 依赖安装失败 → 检查 package.json
- 构建脚本错误 → 本地运行 `pnpm build` 测试
- 权限问题 → 检查 Secrets 配置

### 发布失败

- 版本号已存在 → 使用新的版本号
- npm 发布失败 → 检查 NPM_TOKEN 是否有效
- Docker 推送失败 → 检查 GITHUB_TOKEN 权限

---

🐵 **大圣 - 让发布变得简单！**
