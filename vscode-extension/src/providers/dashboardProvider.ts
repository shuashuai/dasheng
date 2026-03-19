// 🏠 Dashboard 面板提供器

import * as vscode from 'vscode';

export class DashboardProvider {
  public static currentPanel: DashboardProvider | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // 如果面板已存在，则显示它
    if (DashboardProvider.currentPanel) {
      DashboardProvider.currentPanel._panel.reveal(column);
      return DashboardProvider.currentPanel;
    }

    // 否则创建新面板
    const panel = vscode.window.createWebviewPanel(
      'dashengDashboard',
      '🐵 大圣面板',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri]
      }
    );

    DashboardProvider.currentPanel = new DashboardProvider(panel, extensionUri);
    return DashboardProvider.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private readonly _extensionUri: vscode.Uri
  ) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // 监听面板关闭
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // 处理消息
    this._panel.webview.onDidReceiveMessage(
      async (message: { command: string }) => {
        switch (message.command) {
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
          case 'translateSelection':
            await vscode.commands.executeCommand('dasheng.translateSelection');
            break;
          case 'openSettings':
            await vscode.commands.executeCommand('workbench.action.openSettings', 'dasheng');
            break;
          case 'openDocs':
            await vscode.env.openExternal(vscode.Uri.parse('https://github.com/shuashuai/dasheng'));
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    DashboardProvider.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(_webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>大圣面板</title>
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
      background: var(--vscode-editor-background);
      padding: 40px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 48px;
    }
    
    .logo {
      font-size: 80px;
      margin-bottom: 16px;
      animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .title {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      font-size: 18px;
      color: var(--vscode-descriptionForeground);
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }
    
    .card {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 16px;
      padding: 32px;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .card:hover {
      transform: translateY(-4px);
      border-color: var(--vscode-focusBorder);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
    
    .card-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .card-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .card-desc {
      color: var(--vscode-descriptionForeground);
      margin-bottom: 16px;
    }
    
    .card-features {
      list-style: none;
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
    }
    
    .card-features li {
      padding: 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      margin-top: 16px;
    }
    
    .btn:hover {
      background: var(--vscode-button-hoverBackground);
      transform: scale(1.02);
    }
    
    .section {
      margin-bottom: 48px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .quick-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .quick-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--vscode-foreground);
    }
    
    .quick-btn:hover {
      border-color: var(--vscode-focusBorder);
      background: var(--vscode-list-hoverBackground);
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }
    
    .stat-card {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: var(--vscode-button-background);
    }
    
    .stat-label {
      color: var(--vscode-descriptionForeground);
      margin-top: 8px;
    }
    
    .footer {
      text-align: center;
      padding-top: 48px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    
    .links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 16px;
    }
    
    .link {
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
    }
    
    .link:hover {
      text-decoration: underline;
    }
    
    .version {
      display: inline-block;
      padding: 4px 12px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐵</div>
      <div class="title">大圣 Dasheng</div>
      <div class="subtitle">超越贾维斯的 AI 开发助手</div>
    </div>

    <div class="grid">
      <div class="card" onclick="sendCommand('translateYaml')">
        <div class="card-icon">🌐</div>
        <div class="card-title">语言通</div>
        <div class="card-desc">YAML 多语言文件智能同步翻译</div>
        <ul class="card-features">
          <li>✓ 自动检测新增/删除的 key</li>
          <li>✓ 支持 50+ 种语言</li>
          <li>✓ 保持原有结构格式</li>
        </ul>
        <button class="btn">开始翻译</button>
      </div>

      <div class="card" onclick="sendCommand('translateMarkdown')">
        <div class="card-icon">📝</div>
        <div class="card-title">译真经</div>
        <div class="card-desc">Markdown 智能翻译，保护代码块</div>
        <ul class="card-features">
          <li>✓ 保护 frontmatter 和代码块</li>
          <li>✓ 保持 Markdown 格式</li>
          <li>✓ 支持批量翻译</li>
        </ul>
        <button class="btn">开始翻译</button>
      </div>

      <div class="card" onclick="sendCommand('generateCover')">
        <div class="card-icon">🎨</div>
        <div class="card-title">画皮术</div>
        <div class="card-desc">一键生成精美博客封面图</div>
        <ul class="card-features">
          <li>✓ 5 种精美风格</li>
          <li>✓ 多种比例可选</li>
          <li>✓ 从 Markdown 提取信息</li>
        </ul>
        <button class="btn">生成封面</button>
      </div>

      <div class="card" onclick="sendCommand('generateBlog')">
        <div class="card-icon">✍️</div>
        <div class="card-title">妙笔生花</div>
        <div class="card-desc">根据 Release Notes 自动生成博客</div>
        <ul class="card-features">
          <li>✓ 5 种写作风格</li>
          <li>✓ 自动生成 frontmatter</li>
          <li>✓ 支持多种输入源</li>
        </ul>
        <button class="btn">生成博客</button>
      </div>
    </div>

    <div class="section">
      <div class="section-title">⚡ 快捷操作</div>
      <div class="quick-actions">
        <button class="quick-btn" onclick="sendCommand('translateSelection')">
          <span>🔄</span> 翻译选中文本
        </button>
        <button class="quick-btn" onclick="sendCommand('openSettings')">
          <span>⚙️</span> 配置设置
        </button>
        <button class="quick-btn" onclick="sendCommand('openDocs')">
          <span>📖</span> 查看文档
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 功能概览</div>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">4</div>
          <div class="stat-label">核心功能</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">50+</div>
          <div class="stat-label">支持语言</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">5</div>
          <div class="stat-label">封面风格</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">5</div>
          <div class="stat-label">博客风格</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="version">v3.0.0 六耳猕猴</span>
      <div class="links">
        <a href="#" class="link" onclick="sendCommand('openDocs')">文档</a>
        <a href="#" class="link" onclick="sendCommand('openDocs')">GitHub</a>
        <a href="#" class="link" onclick="sendCommand('openDocs')">问题反馈</a>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    function sendCommand(command) {
      vscode.postMessage({ command });
    }
  </script>
</body>
</html>`;
  }
}
