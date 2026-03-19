import * as path from 'path';
import Mocha from 'mocha';
import { globSync } from 'glob';

export function run(): Promise<void> {
  // 创建 Mocha 实例
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000 // 10秒超时
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    try {
      // 使用 globSync 同步查找测试文件
      const files = globSync('**/**.test.js', { cwd: testsRoot });

      // 添加测试文件到 Mocha
      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      // 运行测试
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
