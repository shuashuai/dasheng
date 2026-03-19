import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // 扩展开发路径
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // 测试套件路径
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // 检测是否在 CI 环境
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    // 下载 VS Code，解压并运行集成测试
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',
        '--disable-gpu',
        '--disable-software-rasterizer',
        ...(isCI ? ['--headless'] : [])
      ]
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

void main();
