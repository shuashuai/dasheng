# 故障排除指南

本文档帮助您解决使用大圣 VS Code 扩展时可能遇到的问题。

## 常见问题

### 🔴 扩展无法激活

**症状**: 安装扩展后无法使用命令

**解决方案**:
1. 检查 VS Code 版本是否 >= 1.85.0
2. 重新加载窗口 (`Ctrl+Shift+P` → `Developer: Reload Window`)
3. 检查输出面板中的错误信息 (`Ctrl+Shift+U` → 选择 "🐵 大圣 Dasheng")
4. 尝试卸载后重新安装扩展

### 🔴 API Key 配置问题

**症状**: 提示 "未配置 AI API Key"

**解决方案**:

方法 1 - 环境变量（推荐）:
```bash
# Windows PowerShell
$env:DASHENG_API_KEY = "your-api-key"

# Windows CMD
set DASHENG_API_KEY=your-api-key

# macOS/Linux
export DASHENG_API_KEY=your-api-key
```

方法 2 - VS Code 设置:
1. 打开设置 (`Ctrl+,`)
2. 搜索 "dasheng"
3. 在 `Dasheng: Ai: Api Key` 中输入 API Key

方法 3 - 配置文件:
```json
// settings.json
{
  "dasheng.ai.apiKey": "your-api-key"
}
```

### 🔴 翻译失败

**症状**: 翻译过程中报错

**排查步骤**:

1. **检查网络连接**
   ```bash
   # 测试网络
   ping api.openai.com
   ```

2. **检查 API Key 有效性**
   ```bash
   # 使用 curl 测试
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer your-api-key"
   ```

3. **检查 API 余额**
   - 登录 OpenAI 控制台查看余额

4. **查看详细日志**
   - 打开输出面板 (`Ctrl+Shift+U`)
   - 选择 "🐵 大圣 Dasheng"
   - 查看错误详情

**常见错误及解决**:

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| 401 Unauthorized | API Key 无效 | 检查 API Key |
| 429 Too Many Requests | 请求过于频繁 | 稍后重试 |
| 500 Internal Server Error | AI 服务故障 | 稍后重试 |
| ECONNREFUSED | 网络连接失败 | 检查网络/代理 |

### 🔴 YAML 翻译问题

**症状**: YAML 文件翻译后格式错乱

**解决方案**:
1. 确保 YAML 文件格式正确（可使用在线 YAML 验证器）
2. 检查文件编码是否为 UTF-8
3. 避免使用特殊字符作为 key
4. 检查 `dasheng.translation.preserveFormat` 设置

### 🔴 Markdown 翻译问题

**症状**: 代码块或链接被翻译

**解决方案**:
1. 确保使用的是标准 Markdown 语法
2. 代码块必须使用 ``` 标记
3. 检查是否有嵌套格式导致解析错误

### 🔴 封面生成问题

**症状**: 生成的封面显示异常

**解决方案**:
1. SVG 文件需要用浏览器或图片查看器打开
2. 如需 PNG 格式，使用浏览器打开 SVG 后截图
3. 或使用在线转换工具转换格式

### 🔴 性能问题

**症状**: 操作响应慢或卡顿

**优化建议**:

1. **大文件处理**
   - YAML 文件超过 1000 keys 时，建议分批翻译
   - Markdown 文件超过 5000 字时，分段翻译

2. **网络优化**
   - 使用稳定的网络连接
   - 考虑使用国内 AI 服务（如 Kimi、DeepSeek）
   - 配置代理（如需）

3. **VS Code 优化**
   ```json
   // settings.json
   {
     "dasheng.general.autoDetectChanges": false
   }
   ```

## 调试方法

### 1. 查看日志

1. 打开输出面板 (`Ctrl+Shift+U`)
2. 在右上角下拉菜单中选择 "🐵 大圣 Dasheng"
3. 查看详细的操作日志

### 2. 开发者工具

1. 打开命令面板 (`Ctrl+Shift+P`)
2. 输入并执行 `Developer: Toggle Developer Tools`
3. 在 Console 面板查看错误

### 3. 扩展主机日志

1. 打开输出面板 (`Ctrl+Shift+U`)
2. 选择 "Extension Host"
3. 查找与 dasheng 相关的错误

## 报告问题

如果以上方法无法解决问题，请提交 Issue：

1. 收集以下信息：
   - VS Code 版本 (`Help` → `About`)
   - 扩展版本
   - 操作系统信息
   - 错误日志
   - 复现步骤

2. 提交到 [GitHub Issues](https://github.com/shuashuai/dasheng/issues)

## 重置扩展

如果问题持续，可以尝试重置：

1. 卸载扩展
2. 删除配置：
   ```bash
   # 删除用户配置
   rm ~/.vscode/extensions/code-shuai.dasheng-vscode-*/
   ```
3. 清除 VS Code 缓存
4. 重新安装扩展
5. 重新配置

## 获取帮助

- 📖 [查看文档](https://github.com/shuashuai/dasheng)
- 🐛 [提交 Issue](https://github.com/shuashuai/dasheng/issues)
- 💬 [加入讨论](https://github.com/shuashuai/dasheng/discussions)
