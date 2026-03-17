// ✍️ 七十二变·妙笔生花 - 博客生成命令

import chalk from "chalk";
import ora from "ora";
import { existsSync, readFileSync } from "fs";
import inquirer from "inquirer";
import type { GenerateBlogOptions } from "../../types/index.js";
import { BlogGenerator } from "../../core/services/blog-generator.js";
import type { BlogStyle } from "../../types/index.js";

export async function generateBlogCommand(
  file: string | undefined,
  options: GenerateBlogOptions,
): Promise<void> {
  console.log(chalk.yellow("\n🐵 召唤神通：七十二变·妙笔生花\n"));

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
    console.log(chalk.cyan("ℹ️  演示模式：使用模拟生成（无需 API Key）\n"));
  } else {
    console.log(chalk.cyan(`🤖 使用 AI 服务: ${aiService}\n`));
  }

  const spinner = ora({
    text: "正在准备...",
    spinner: "dots",
  }).start();

  try {
    // 创建生成器
    const generator = new BlogGenerator({
      provider: "openai",
      apiKey,
      baseUrl,
      mock: isMockMode,
    });

    // 收集输入信息
    let input: {
      rawContent?: string;
      topic?: string;
      keyPoints?: string[];
      targetAudience?: string;
      style?: BlogStyle;
    };

    if (file && existsSync(file)) {
      // 从文件读取 Release Notes
      spinner.text = "正在读取 Release Notes...";
      const content = readFileSync(file, "utf-8");
      input = { rawContent: content };
      spinner.stop();
      console.log(chalk.green(`✅ 已读取文件: ${file}\n`));
    } else if (options.interactive) {
      // 交互式输入
      spinner.stop();
      input = await interactiveInput();
    } else {
      // 使用命令行参数
      spinner.stop();
      input = {
        topic: options.topic,
        keyPoints: options.points
          ? options.points.split(",").map((p) => p.trim())
          : undefined,
        targetAudience: options.audience,
        style: options.style as BlogStyle,
      };

      if (!input.topic && !input.keyPoints) {
        console.error(
          chalk.red("❌ 请提供主题(-t)、要点(-p)或使用交互式模式(-i)"),
        );
        console.log(chalk.gray("\n示例:"));
        console.log(
          chalk.cyan(
            '  dasheng generate-blog -t "React 19 新特性" -p "并发渲染,Server Components,Actions"',
          ),
        );
        console.log(chalk.cyan("  dasheng generate-blog ./RELEASE_NOTES.md"));
        console.log(chalk.cyan("  dasheng generate-blog -i"));
        process.exit(1);
      }
    }

    // 确定风格
    const style = (options.style as BlogStyle) || input.style || "release";

    // 确定生成数量
    const count = parseInt(String(options.multi || "1"), 10);

    console.log(chalk.blue(`博客风格: ${getStyleDisplayName(style)}`));
    console.log(chalk.blue(`生成数量: ${count} 篇\n`));

    // 生成博客
    const generateSpinner = ora("正在施展妙笔生花神通...").start();

    const articles = await generator.generate(
      {
        ...input,
        style,
      },
      count,
    );

    generateSpinner.succeed("妙笔生花神通施展完成！");

    // 显示结果
    console.log(chalk.green("\n✅ 生成完成！\n"));

    const outputFiles: string[] = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];

      console.log(chalk.cyan(`\n📄 文章 ${i + 1}/${articles.length}:`));
      console.log(`   标题: ${chalk.bold(article.title)}`);
      console.log(`   摘要: ${chalk.gray(article.excerpt.slice(0, 80))}...`);
      console.log(`   标签: ${chalk.yellow(article.tags.join(", "))}`);

      // 保存文件
      const outputPath =
        options.output || `blog-post-${Date.now()}-${i + 1}.md`;
      const finalPath =
        count > 1 ? outputPath.replace(".md", `-${i + 1}.md`) : outputPath;

      generator.saveToFile(article, finalPath);
      outputFiles.push(finalPath);

      console.log(`   文件: ${chalk.green(finalPath)}`);
    }

    // 多篇文章时提示选择
    if (count > 1 && !isMockMode) {
      console.log(
        chalk.cyan("\n💡 提示: 多篇文章已生成，您可以对比选择最合适的一篇。"),
      );
    }

    console.log();

    if (isMockMode) {
      console.log(chalk.cyan("ℹ️  演示模式说明:"));
      console.log(chalk.gray("   生成的内容为模拟数据，仅用于演示功能。"));
      console.log(chalk.gray("   设置 OPENAI_API_KEY 后可获得真实生成内容。"));
      console.log();
    } else {
      console.log(chalk.green(`✨ 已成功使用 ${aiService} 完成博客生成！`));
      console.log();
    }
  } catch (error) {
    spinner.fail("妙笔生花神通施展失败");
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

/**
 * 交互式输入
 */
async function interactiveInput(): Promise<{
  topic?: string;
  keyPoints?: string[];
  targetAudience?: string;
  style?: BlogStyle;
}> {
  console.log(chalk.cyan("📝 请回答以下问题来生成博客:\n"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "topic",
      message: "博客主题是什么?",
      validate: (input) => input.trim() !== "" || "主题不能为空",
    },
    {
      type: "input",
      name: "points",
      message: "关键要点（用逗号分隔）:",
      validate: (input) => input.trim() !== "" || "至少提供一个要点",
    },
    {
      type: "list",
      name: "style",
      message: "选择博客风格:",
      choices: [
        { name: "📦 版本发布 - 产品更新公告", value: "release" },
        { name: "📚 教程指南 - 手把手教学", value: "tutorial" },
        { name: "📰 新闻资讯 - 行业动态", value: "news" },
        { name: "🔍 深度分析 - 技术原理", value: "deep-dive" },
        { name: "📖 故事叙述 - 场景化讲述", value: "story" },
      ],
    },
    {
      type: "input",
      name: "audience",
      message: "目标读者（可选）:",
      default: "开发者",
    },
  ]);

  return {
    topic: answers.topic,
    keyPoints: answers.points.split(",").map((p: string) => p.trim()),
    targetAudience: answers.audience,
    style: answers.style,
  };
}

/**
 * 获取风格显示名称
 */
function getStyleDisplayName(style: BlogStyle): string {
  const names: Record<BlogStyle, string> = {
    release: "版本发布",
    tutorial: "教程指南",
    news: "新闻资讯",
    "deep-dive": "深度分析",
    story: "故事叙述",
  };
  return names[style] || style;
}
