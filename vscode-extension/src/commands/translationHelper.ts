// 🔄 翻译辅助功能

import * as vscode from 'vscode';
import { ConfigManager } from '../utils/config';
import { createAIProvider } from '../utils/aiProvider';
import { Logger } from '../utils/logger';

export class TranslationHelper {
  constructor(private configManager: ConfigManager) {}

  /**
   * 翻译选中的文本
   */
  async translateSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      void vscode.window.showErrorMessage('请先打开编辑器');
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
      void vscode.window.showErrorMessage('请先选择要翻译的文本');
      return;
    }

    if (!this.configManager.isAIConfigValid()) {
      await this.configManager.showConfigMissingPrompt();
      return;
    }

    // 选择目标语言
    const targetLang = await vscode.window.showQuickPick(
      [
        { label: '中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
        { label: '日本語', value: 'ja-JP' },
        { label: '한국어', value: 'ko-KR' }
      ],
      {
        placeHolder: '选择目标语言'
      }
    );

    if (!targetLang) {
      return;
    }

    // 执行翻译
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '正在翻译...'
      },
      async () => {
        try {
          const aiConfig = this.configManager.getAIConfig();
          const provider = createAIProvider(aiConfig);

          const translated = await provider.translate(text, {
            to: targetLang.value,
            context: '这是编辑器中选中的文本'
          });

          // 显示结果
          const action = await vscode.window.showInformationMessage(
            translated,
            '替换原文',
            '复制到剪贴板',
            '插入到光标处'
          );

          if (action === '替换原文') {
            void editor.edit(editBuilder => {
              editBuilder.replace(selection, translated);
            });
          } else if (action === '复制到剪贴板') {
            await vscode.env.clipboard.writeText(translated);
            void vscode.window.showInformationMessage('已复制到剪贴板');
          } else if (action === '插入到光标处') {
            void editor.edit(editBuilder => {
              editBuilder.insert(editor.selection.active, translated);
            });
          }
        } catch (error) {
          Logger.error('翻译失败', error as Error);
          void vscode.window.showErrorMessage(`翻译失败: ${(error as Error).message}`);
        }
      }
    );
  }
}
