#!/usr/bin/env node

// 🐵 大圣召唤入口
// 此文件用于全局安装后的命令调用

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 如果是在开发环境，使用 tsx 运行
// 如果是生产环境，使用 dist 目录
const isDev = process.env.DASHENG_DEV === 'true';

if (isDev) {
  // 开发模式：使用 tsx 直接运行 TypeScript
  const { spawn } = await import('child_process');
  const tsxPath = join(__dirname, '..', 'node_modules', '.bin', 'tsx');
  const cliPath = join(__dirname, '..', 'src', 'cli', 'index.ts');
  
  const child = spawn(tsxPath, [cliPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // 生产模式：使用编译后的 JavaScript
  await import('../dist/cli/index.js');
}
