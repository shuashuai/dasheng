// 📝 日志工具

import * as vscode from 'vscode';

export class Logger {
  private static outputChannel: vscode.OutputChannel;

  static initialize(channel: vscode.OutputChannel) {
    this.outputChannel = channel;
  }

  static info(message: string) {
    this.log('INFO', message);
  }

  static warn(message: string) {
    this.log('WARN', message);
  }

  static error(message: string, error?: Error) {
    this.log('ERROR', message);
    if (error) {
      this.log('ERROR', error.stack || error.message);
    }
  }

  static debug(message: string) {
    this.log('DEBUG', message);
  }

  private static log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  static show() {
    this.outputChannel.show();
  }
}
