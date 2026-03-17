// 📝 七十二变·译真经 - Markdown 翻译命令

import chalk from "chalk";
import ora from "ora";
import { existsSync } from "fs";
import type { TranslateMdOptions } from "../../types/index.js";
import { MarkdownTranslator } from "../../core/services/markdown-translator.js";

export async function translateMdCommand(
  file: string,
  options: TranslateMdOptions,
): Promise<void> {
  console.log(chalk.yellow("\n🐵 召唤神通：七十二变·译真经\n"));

  // 检查文件是否存在
  if (!existsSync(file)) {
    console.error(chalk.red(`❌ 文件不存在: ${file}`));
    process.exit(1);
  }

  // 获取 API Key 和配置
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const forceMock = process.env.DASHENG_MOCK === "true";

  // 检测使用的 AI 服务
  let aiService = "OpenAI";
  if (baseUrl?.includes("moonshot")) {
    aiService = "Kimi (Moonshot)";
  } else if (baseUrl?.includes("deepseek")) {
    aiService = "DeepSeek";
  } else if (baseUrl?.includes("azure")) {
    aiService = "Azure OpenAI";
  }

  const isMockMode = forceMock || !apiKey;

  if (isMockMode) {
    console.log(chalk.cyan("ℹ️  演示模式：使用模拟翻译（无需 API Key）\n"));
  } else {
    console.log(chalk.cyan(`🤖 使用 AI 服务: ${aiService}\n`));
  }

  const spinner = ora({
    text: "正在读取 Markdown 文件...",
    spinner: "dots",
  }).start();

  try {
    // 创建翻译器
    const translator = new MarkdownTranslator({
      provider: "openai",
      apiKey,
      baseUrl,
      mock: isMockMode,
    });

    spinner.text = "正在解析并保护特殊内容...";

    const targetLang = options.targetLang || "zh-CN";

    spinner.stop();
    console.log(chalk.gray(`源文件: ${file}`));
    console.log(chalk.gray(`目标语言: ${targetLang}\n`));

    const translateSpinner = ora("正在翻译内容...").start();

    // 执行翻译
    const result = await translator.translate(
      file,
      targetLang,
      options.output,
      options.keepFrontmatter !== false,
    );

    translateSpinner.succeed("翻译完成！");

    // 输出结果
    console.log(chalk.green("\n✅ 译真经神通施展完成！\n"));
    console.log(chalk.cyan("📄 翻译统计:"));
    console.log(`   源文件: ${chalk.gray(result.sourceFile)}`);
    console.log(`   输出文件: ${chalk.green(result.outputFile)}`);
    console.log(
      `   翻译字符数: ${chalk.blue(result.charsTranslated.toLocaleString())}`,
    );
    console.log(`   保护的代码块: ${chalk.yellow(result.codeBlocksProtected)}`);
    console.log(`   保护的链接/图片: ${chalk.yellow(result.linksProtected)}`);
    console.log();

    if (isMockMode) {
      console.log(chalk.cyan("ℹ️  演示模式说明:"));
      console.log(chalk.gray("   翻译结果为模拟数据，仅用于演示功能。"));
      console.log(chalk.gray("   设置 OPENAI_API_KEY 后可获得真实翻译。"));
      console.log();
    } else {
      console.log(chalk.green(`✨ 已成功使用 ${aiService} 完成翻译！`));
      console.log();
    }
  } catch (error) {
    spinner.fail("译真经神通施展失败");
    console.error(
      chalk.red("\n❌ 错误:"),
      error instanceof Error ? error.message : error,
    );

    if (error instanceof Error && error.message.includes("API Key")) {
      console.log(chalk.gray("\n请检查环境变量设置:"));
      console.log(chalk.cyan("  Windows PowerShell:"));
      console.log(chalk.cyan('    $env:OPENAI_API_KEY="你的Key"'));
      console.log(
        chalk.cyan('    $env:OPENAI_BASE_URL="https://api.deepseek.com/v1"'),
      );
    }

    process.exit(1);
  }
}
