import * as assert from 'assert';
import * as vscode from 'vscode';
import { Logger } from '../logger';

suite('Logger Test Suite', () => {
  let mockChannel: vscode.OutputChannel;

  setup(() => {
    // 创建 mock 输出通道
    mockChannel = {
      name: 'Test Channel',
      append: (_value: string) => {},
      appendLine: (_value: string) => {},
      clear: () => {},
      show: (_preserveFocus?: boolean) => {},
      hide: () => {},
      dispose: () => {}
    } as vscode.OutputChannel;

    Logger.initialize(mockChannel);
  });

  test('Logger should be initialized', () => {
    // 简单验证初始化不会报错
    assert.doesNotThrow(() => {
      Logger.info('test message');
    });
  });

  test('Logger methods should not throw', () => {
    assert.doesNotThrow(() => {
      Logger.info('info message');
      Logger.warn('warn message');
      Logger.error('error message');
      Logger.debug('debug message');
    });
  });
});
