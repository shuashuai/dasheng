#!/usr/bin/env node

// 🐵 大圣 CLI 入口 - 召唤咒语解析器

import { config } from "dotenv";
config(); // 加载 .env 文件

import { program } from "commander";
import chalk from "chalk";

const packageJson = {
  version: "3.0.7",
};

// Logo (简化，避免 Windows Canvas 问题)
const LOGO = "🐵 大圣 Dasheng - 72变无所不能\n";

program
  .name("dasheng")
  .description("大圣 - 超越贾维斯的中国智造AI助手")
  .version(packageJson.version, "-v, --version", "显示版本号")
  .helpOption("-h, --help", "显示帮助信息")
  .addHelpText("before", LOGO)
  .addHelpText(
    "after",
    "示例: dasheng translate-yaml ./en.yaml --target ./locales/",
  );

// ==================== 七十二变·语言通 ====================
program
  .command("translate-yaml")
  .alias("ty")
  .description("🌐 语言通 - YAML多语言文件同步翻译")
  .argument("<base-file>", "基础语言文件路径 (如 en.yaml)")
  .option("-t, --target <dir>", "目标语言文件目录", "./locales/")
  .option("-l, --lang <langs...>", "指定目标语言 (如 zh-CN ja-JP)")
  .option("-d, --dry-run", "试演预览，不实际修改文件")
  .option("-f, --force", "强制重新翻译所有内容（包括已存在的key）")
  .option("-c, --config <path>", "元神配置文件路径")
  .action(async (file, options) => {
    const { translateYamlCommand } =
      await import("./commands/translate-yaml.js");
    await translateYamlCommand(file, options);
  });

// ==================== 七十二变·译真经 ====================
program
  .command("translate-md")
  .alias("tm")
  .description("📝 译真经 - Markdown文件翻译(保护frontMatter)")
  .argument("<file>", "要翻译的Markdown文件路径")
  .option("-t, --target-lang <lang>", "目标语言", "zh-CN")
  .option("-o, --output <path>", "输出文件路径")
  .option("-k, --keep-frontmatter", "保持frontMatter格式", true)
  .action(async (file, options) => {
    const { translateMdCommand } = await import("./commands/translate-md.js");
    await translateMdCommand(file, options);
  });

// ==================== 七十二变·画皮术 ====================
program
  .command("generate-cover")
  .alias("gc")
  .description("🎨 画皮术 - 根据博客内容生成封面图")
  .argument("[md-file]", "博客Markdown文件路径（可选，也可用 --topic 指定）")
  .option(
    "-s, --style <style>",
    "封面风格 (tech/minimal/gradient/illustration/business)",
    "tech",
  )
  .option(
    "-r, --ratio <ratio>",
    "封面比例 (16:9/1:1/9:16/4:3)，与 --width/--height 互斥",
  )
  .option("-o, --output <path>", "输出文件路径", "./cover.png")
  .option("-w, --width <px>", "自定义宽度（与 --height 一起使用，跳过比例）")
  .option("-h, --height <px>", "自定义高度（与 --width 一起使用）")
  .option("-t, --topic <text>", "封面主题（如不提供则尝试从 Markdown 提取）")
  .option("--subtitle <text>", "副标题")
  .option("--author <text>", "作者名称")
  .option("-p, --prompt <text>", "自定义 AI 生成提示词（高级用法）")
  .action(async (file, options) => {
    const { generateCoverCommand } =
      await import("./commands/generate-cover.js");
    await generateCoverCommand(file, options);
  });

// ==================== 七十二变·妙笔生花 ====================
program
  .command("generate-blog")
  .alias("gb")
  .description("✍️ 妙笔生花 - 根据Release Notes或关键信息生成博客")
  .argument("[file]", "Release Notes文件路径（可选）")
  .option(
    "-s, --style <style>",
    "博客风格 (release/tutorial/news/deep-dive/story)",
  )
  .option("-t, --topic <text>", "博客主题")
  .option("-p, --points <items>", "关键要点（逗号分隔）")
  .option("-a, --audience <text>", "目标读者")
  .option("-o, --output <path>", "输出文件路径")
  .option("-c, --copy", "生成后复制到剪贴板", false)
  .option("-i, --interactive", "交互式输入", false)
  .option("-m, --multi <number>", "生成多篇文章供选择", "1")
  .action(async (file, options) => {
    const { generateBlogCommand } = await import("./commands/generate-blog.js");
    await generateBlogCommand(file, options);
  });

// ==================== 通背猿猴·TUI 交互界面 ====================
program
  .command("tui")
  .alias("ui")
  .description("🖥️  通背猿猴 - 启动交互式 TUI 界面")
  .action(async () => {
    const { startTUI } = await import("../tui/index.js");
    await startTUI();
  });

// ==================== 元神配置 ====================
program
  .command("config")
  .description("⚙️  元神配置 - 查看或修改大圣配置")
  .option("-g, --global", "修改全局配置（~/.dashengrc.json）")
  .option("-l, --local", "修改本地配置（./.dashengrc.json）")
  .option("-s, --show", "显示当前配置")
  .action(async (_options) => {
    console.log(chalk.yellow("🐵 元神配置功能开发中..."));
    console.log(chalk.gray("当前配置路径:"));
    console.log(chalk.cyan("  全局: ~/.dashengrc.json"));
    console.log(chalk.cyan("  本地: ./.dashengrc.json"));
  });

// 解析命令行参数
program.parse();

// 如果没有参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
