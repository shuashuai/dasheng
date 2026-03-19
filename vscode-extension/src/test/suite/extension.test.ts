import * as assert from 'assert';
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  void vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    // 检查扩展是否已加载
    const extension = vscode.extensions.getExtension('code-shuai.dasheng-vscode');
    assert.ok(extension, 'Extension should be present');
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('code-shuai.dasheng-vscode');
    if (extension) {
      await extension.activate();
      assert.strictEqual(extension.isActive, true, 'Extension should be active');
    }
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);

    // 检查核心命令是否已注册
    assert.ok(
      commands.includes('dasheng.translateYaml'),
      'translateYaml command should be registered'
    );
    assert.ok(
      commands.includes('dasheng.translateMarkdown'),
      'translateMarkdown command should be registered'
    );
    assert.ok(
      commands.includes('dasheng.generateCover'),
      'generateCover command should be registered'
    );
    assert.ok(
      commands.includes('dasheng.generateBlog'),
      'generateBlog command should be registered'
    );
    assert.ok(
      commands.includes('dasheng.openDashboard'),
      'openDashboard command should be registered'
    );
  });
});
