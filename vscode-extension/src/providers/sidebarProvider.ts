// 📂 侧边栏提供器

import * as vscode from 'vscode';

export class DashengSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'dasheng.sidebar';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 处理消息
    webviewView.webview.onDidReceiveMessage(async (data: { type: string }) => {
      switch (data.type) {
        case 'translateYaml':
          await vscode.commands.executeCommand('dasheng.translateYaml');
          break;
        case 'translateMarkdown':
          await vscode.commands.executeCommand('dasheng.translateMarkdown');
          break;
        case 'generateCover':
          await vscode.commands.executeCommand('dasheng.generateCover');
          break;
        case 'generateBlog':
          await vscode.commands.executeCommand('dasheng.generateBlog');
          break;
        case 'openDashboard':
          await vscode.commands.executeCommand('dasheng.openDashboard');
          break;
        case 'openSettings':
          await vscode.commands.executeCommand('dasheng.openSettings');
          break;
      }
    });
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private _getHtmlForWebview(_webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>大圣助手</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 16px;
    }
    
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
      margin-bottom: 20px;
    }
    
    .logo {
      font-size: 48px;
      margin-bottom: 8px;
    }
    
    .title {
      font-size: 18px;
      font-weight: bold;
      color: var(--vscode-foreground);
    }
    
    .subtitle {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    
    .card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .card:hover {
      background: var(--vscode-list-hoverBackground);
      border-color: var(--vscode-focusBorder);
    }
    
    .card-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .card-title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .card-desc {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    
    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      width: 100%;
      margin-bottom: 8px;
      transition: background 0.2s;
    }
    
    .btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--vscode-button-background);
      color: var(--vscode-button-background);
    }
    
    .btn-secondary:hover {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    .grid .card {
      text-align: center;
    }
    
    .feature-list {
      list-style: none;
    }
    
    .feature-list li {
      padding: 8px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .feature-list li:last-child {
      border-bottom: none;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 10px;
      font-size: 10px;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--vscode-panel-border);
      text-align: center;
    }
    
    .footer-text {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🐵</div>
    <div class="title">大圣 Dasheng</div>
    <div class="subtitle">七十二变，无所不能</div>
  </div>

  <div class="section">
    <div class="section-title">🎯 核心功能</div>
    <div class="grid">
      <div class="card" onclick="sendMessage('translateYaml')">
        <div class="card-icon">🌐</div>
        <div class="card-title">语言通</div>
        <div class="card-desc">YAML 翻译</div>
      </div>
      <div class="card" onclick="sendMessage('translateMarkdown')">
        <div class="card-icon">📝</div>
        <div class="card-title">译真经</div>
        <div class="card-desc">MD 翻译</div>
      </div>
      <div class="card" onclick="sendMessage('generateCover')">
        <div class="card-icon">🎨</div>
        <div class="card-title">画皮术</div>
        <div class="card-desc">生成封面</div>
      </div>
      <div class="card" onclick="sendMessage('generateBlog')">
        <div class="card-icon">✍️</div>
        <div class="card-title">妙笔生花</div>
        <div class="card-desc">生成博客</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">⚡ 快捷操作</div>
    <button class="btn" onclick="sendMessage('openDashboard')">
      <span>🏠</span> 打开大圣面板
    </button>
    <button class="btn btn-secondary" onclick="sendMessage('openSettings')">
      <span>⚙️</span> 配置设置
    </button>
  </div>

  <div class="section">
    <div class="section-title">📋 使用提示</div>
    <ul class="feature-list">
      <li><span>⌨️</span> 选中文本按 Ctrl+Shift+T 快速翻译</li>
      <li><span>📁</span> 右键 YAML/MD 文件快速操作</li>
      <li><span>🔄</span> 自动检测 YAML 文件变化</li>
      <li><span>🎨</span> 支持 5 种封面风格</li>
    </ul>
  </div>

  <div class="footer">
    <span class="badge">v3.0.0</span>
    <div class="footer-text" style="margin-top: 8px;">
      六耳猕猴 · VS Code 化身
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    function sendMessage(type) {
      vscode.postMessage({ type });
    }
  </script>
</body>
</html>`;
  }
}
