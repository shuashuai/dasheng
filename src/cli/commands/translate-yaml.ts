// 🌐 七十二变·语言通 - YAML 翻译命令

import chalk from 'chalk';
import ora from 'ora';
import { existsSync, readFileSync } from 'fs';
import type { TranslateYamlOptions } from '../../types/index.js';
import { YamlTranslator } from '../../core/services/yaml-translator.js';
import { parseYaml, extractKeys, compareYamlKeys, getValueByPath } from '../../core/utils/yaml-utils.js';

export async function translateYamlCommand(
  file: string,
  options: TranslateYamlOptions
): Promise<void> {
  console.log(chalk.yellow('\n🐵 召唤神通：七十二变·语言通\n'));

  // 检查文件是否存在
  if (!existsSync(file)) {
    console.error(chalk.red(`❌ 文件不存在: ${file}`));
    process.exit(1);
  }

  // 获取 API Key 和 Base URL
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const forceMock = process.env.DASHENG_MOCK === 'true';
  
  // 检测使用的 AI 服务
  let aiService = 'OpenAI';
  if (baseUrl?.includes('moonshot')) {
    aiService = 'Kimi (Moonshot)';
  } else if (baseUrl?.includes('azure')) {
    aiService = 'Azure OpenAI';
  }
  
  const isMockMode = forceMock || !apiKey || options.dryRun;
  
  if (isMockMode && !options.dryRun) {
    console.log(chalk.cyan('ℹ️  演示模式：使用模拟翻译（无需 API Key）\n'));
  } else if (apiKey) {
    console.log(chalk.cyan(`🤖 使用 AI 服务: ${aiService}\n`));
  }

  const spinner = ora({
    text: '正在分析语言文件...',
    spinner: 'dots'
  }).start();

  try {
    // 读取基础文件
    const baseContent = readFileSync(file, 'utf-8');
    const baseData = parseYaml(baseContent);
    const baseKeys = extractKeys(baseData);

    spinner.stop();

    console.log(chalk.blue(`基础文件: ${file}`));
    console.log(chalk.gray(`共有 ${baseKeys.length} 个 key\n`));

    // 检测目标语言文件
    const targetDir = options.target || './locales/';
    const targetLanguages = options.lang || ['zh-CN'];

    console.log(chalk.blue(`目标语言: ${targetLanguages.join(', ')}\n`));

    // 对每个目标语言分析差异
    for (const lang of targetLanguages) {
      const targetFile = `${targetDir}/${lang}.yaml`;
      
      if (existsSync(targetFile)) {
        const targetContent = readFileSync(targetFile, 'utf-8');
        const targetData = parseYaml(targetContent);
        
        const { missing, extra, same } = compareYamlKeys(baseData, targetData);

        console.log(chalk.cyan(`📄 ${lang}.yaml`));
        console.log(`   ${chalk.green('✓')} 已有: ${same.length} 个`);
        console.log(`   ${chalk.yellow('⚠')} 缺失: ${missing.length} 个`);
        console.log(`   ${chalk.red('✗')} 多余: ${extra.length} 个`);

        if (missing.length > 0) {
          console.log(chalk.gray('\n   待翻译内容:'));
          missing.slice(0, 5).forEach(key => {
            const value = getValueByPath(baseData, key);
            console.log(chalk.gray(`     - ${key}: "${value}"`));
          });
          if (missing.length > 5) {
            console.log(chalk.gray(`     ... 还有 ${missing.length - 5} 个`));
          }
        }
        console.log();
      } else {
        console.log(chalk.cyan(`📄 ${lang}.yaml`));
        console.log(`   ${chalk.yellow('⚠')} 文件不存在，将创建新文件`);
        console.log(`   需要翻译 ${baseKeys.length} 个 key\n`);
      }
    }

    // 试演模式结束
    if (options.dryRun) {
      console.log(chalk.yellow('⚠️  试演模式，未实际翻译'));
      console.log(chalk.gray('\n提示: 去掉 --dry-run 可进行真实翻译'));
      return;
    }

    // 真实翻译模式
    spinner.start(isMockMode ? '正在使用模拟翻译...' : `正在调用 ${aiService} 翻译...`);

    const translator = new YamlTranslator({
      provider: 'openai',  // Kimi 兼容 OpenAI 格式
      apiKey,
      baseUrl,
      mock: isMockMode  // 试演模式或强制 mock 时使用模拟翻译
    });

    translator.setDryRun(false);
    translator.setForce(options.force || false);
    spinner.stop();

    const results = await translator.translate(file, targetDir, targetLanguages);

    console.log(chalk.green('\n✅ 语言通神通施展完成！\n'));

    for (const result of results) {
      console.log(chalk.cyan(`📄 ${result.file}`));
      console.log(`   新增: ${chalk.green(result.added)}`);
      console.log(`   更新: ${chalk.blue(result.updated)}`);
      console.log(`   删除: ${chalk.red(result.removed)}`);
      console.log(`   不变: ${chalk.gray(result.unchanged)}`);
      console.log();
    }

    if (isMockMode) {
      console.log(chalk.cyan('ℹ️  演示模式说明:'));
      console.log(chalk.gray('   翻译结果为模拟数据，仅用于演示功能。'));
      console.log(chalk.gray('   设置 OPENAI_API_KEY 后可获得真实翻译。'));
      console.log();
    } else {
      console.log(chalk.green(`✨ 已成功使用 ${aiService} 完成翻译！`));
      console.log();
    }

  } catch (error) {
    spinner.fail('语言通神通施展失败');
    console.error(chalk.red('\n❌ 错误:'), error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('API Key')) {
      console.log(chalk.gray('\n请检查环境变量设置:'));
      console.log(chalk.cyan('  Windows PowerShell:'));
      console.log(chalk.cyan('    $env:OPENAI_API_KEY="你的Key"'));
      console.log(chalk.cyan('    $env:OPENAI_BASE_URL="https://api.moonshot.cn/v1"'));
    }
    
    process.exit(1);
  }
}
