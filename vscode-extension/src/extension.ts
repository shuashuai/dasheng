// 🐵 大圣 VS Code 扩展入口 - 六耳猕猴·IDE 化身

import * as vscode from 'vscode';
import { DashengSidebarProvider } from './providers/sidebarProvider';
import { DashboardProvider } from './providers/dashboardProvider';
import { YamlTranslateCommand } from './commands/yamlTranslate';
import { MarkdownTranslateCommand } from './commands/markdownTranslate';
import { CoverGenerateCommand } from './commands/coverGenerate';
import { BlogGenerateCommand } from './commands/blogGenerate';
import { TranslationHelper } from './commands/translationHelper';
import { ConfigManager } from './utils/config';
import { Logger } from './utils/logger';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  // 初始化输出通道
  outputChannel = vscode.window.createOutputChannel('🐵 大圣 Dasheng');
  Logger.initialize(outputChannel);

  Logger.info('🐵 大圣正在苏醒...');
  Logger.info('七十二变，无所不能！');

  // 初始化配置管理器
  const configManager = new ConfigManager();

  // 注册侧边栏提供器
  const sidebarProvider = new DashengSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(DashengSidebarProvider.viewType, sidebarProvider)
  );

  // 注册命令
  registerCommands(context, configManager, sidebarProvider);

  // 注册文件监视器
  registerFileWatchers(context, configManager);

  // 注册状态栏项
  registerStatusBar(context);

  Logger.info('✅ 大圣已就绪！');

  // 显示欢迎信息
  if (configManager.get('general.showNotifications', true)) {
    void vscode.window
      .showInformationMessage('🐵 大圣已就绪！按 Ctrl+Shift+D 打开面板', '打开面板', '查看文档')
      .then(selection => {
        if (selection === '打开面板') {
          void vscode.commands.executeCommand('dasheng.openDashboard');
        } else if (selection === '查看文档') {
          void vscode.env.openExternal(vscode.Uri.parse('https://github.com/shuashuai/dasheng'));
        }
      });
  }
}

function registerCommands(
  context: vscode.ExtensionContext,
  configManager: ConfigManager,
  sidebarProvider: DashengSidebarProvider
) {
  // 翻译相关命令
  const yamlCommand = new YamlTranslateCommand(configManager);
  const mdCommand = new MarkdownTranslateCommand(configManager);
  const coverCommand = new CoverGenerateCommand(configManager);
  const blogCommand = new BlogGenerateCommand(configManager);
  const translationHelper = new TranslationHelper(configManager);

  // ==================== YAML 翻译命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.translateYaml', () => {
      void yamlCommand.execute();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.translateYamlQuick', (uri: vscode.Uri) => {
      void yamlCommand.executeQuick(uri);
    })
  );

  // ==================== Markdown 翻译命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.translateMarkdown', () => {
      void mdCommand.execute();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.translateMarkdownQuick', (uri: vscode.Uri) => {
      void mdCommand.executeQuick(uri);
    })
  );

  // ==================== 封面生成命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.generateCover', () => {
      void coverCommand.execute();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.generateCoverForFile', (uri: vscode.Uri) => {
      void coverCommand.executeForFile(uri);
    })
  );

  // ==================== 博客生成命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.generateBlog', () => {
      void blogCommand.execute();
    })
  );

  // ==================== 选中翻译命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.translateSelection', () => {
      void translationHelper.translateSelection();
    })
  );

  // ==================== 面板命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.openDashboard', () => {
      DashboardProvider.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.openSettings', () => {
      void vscode.commands.executeCommand('workbench.action.openSettings', 'dasheng');
    })
  );

  // ==================== 刷新命令 ====================
  context.subscriptions.push(
    vscode.commands.registerCommand('dasheng.refreshSidebar', () => {
      sidebarProvider.refresh();
    })
  );
}

function registerFileWatchers(context: vscode.ExtensionContext, configManager: ConfigManager) {
  if (!configManager.get('general.autoDetectChanges', true)) {
    return;
  }

  // 监视 YAML 文件变化
  const yamlWatcher = vscode.workspace.createFileSystemWatcher('**/*.yaml');

  yamlWatcher.onDidChange(uri => {
    Logger.info(`检测到 YAML 文件变化: ${uri.fsPath}`);
    // 可以在这里实现自动同步逻辑
  });

  yamlWatcher.onDidCreate(uri => {
    Logger.info(`检测到新 YAML 文件: ${uri.fsPath}`);
  });

  context.subscriptions.push(yamlWatcher);
}

function registerStatusBar(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

  statusBarItem.text = '$(zap) 大圣';
  statusBarItem.tooltip = '🐵 大圣 Dasheng - 点击打开面板';
  statusBarItem.command = 'dasheng.openDashboard';
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);
}

export function deactivate() {
  Logger.info('🐵 大圣已休眠');
  if (outputChannel) {
    outputChannel.dispose();
  }
}
