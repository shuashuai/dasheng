// 🎨 七十二变·画皮术 - 封面生成命令

import chalk from 'chalk';
import { existsSync } from 'fs';
import type { GenerateCoverOptions } from '../../types/index.js';
import { CoverGenerator, CoverGenerateOptions } from '../../core/services/cover-generator.js';
import type { CoverStyle } from '../../types/index.js';

export async function generateCoverCommand(
  file: string | undefined,
  options: GenerateCoverOptions
): Promise<void> {
  console.log(chalk.yellow('\n🐵 召唤神通：七十二变·画皮术\n'));

  try {
    // 创建封面生成器
    const generator = new CoverGenerator();

    // 确定尺寸（支持多种方式）
    let width: number;
    let height: number;
    let sizeLabel: string;

    // 方式1: 同时指定宽高
    if (options.width && options.height) {
      width = parseInt(String(options.width), 10);
      height = parseInt(String(options.height), 10);
      sizeLabel = `${width}x${height} (自定义)`;
    }
    // 方式2: 只指定宽度，按比例计算
    else if (options.width && !options.height) {
      width = parseInt(String(options.width), 10);
      const ratio = options.ratio || '16:9';
      const ratioParts = ratio.split(':').map(Number);
      height = Math.round(width * ratioParts[1] / ratioParts[0]);
      sizeLabel = `${width}x${height} (${options.ratio || '16:9'})`;
    }
    // 方式3: 只指定高度，按比例计算
    else if (!options.width && options.height) {
      height = parseInt(String(options.height), 10);
      const ratio = options.ratio || '16:9';
      const ratioParts = ratio.split(':').map(Number);
      width = Math.round(height * ratioParts[0] / ratioParts[1]);
      sizeLabel = `${width}x${height} (${options.ratio || '16:9'})`;
    }
    // 方式4: 使用预设比例
    else {
      const dimensions = generator.parseRatio(options.ratio || '16:9');
      width = dimensions.width;
      height = dimensions.height;
      sizeLabel = `${width}x${height} (${options.ratio || '16:9'})`;
    }

    // 获取内容信息
    let title: string;
    let subtitle: string | undefined;
    let author: string | undefined;
    let date: string | undefined;

    if (file && existsSync(file)) {
      // 从 Markdown 文件提取
      console.log(chalk.blue(`正在解析文件: ${file}`));
      const info = generator.extractFromMarkdown(file);
      title = info.title;
      subtitle = info.subtitle;
      author = info.author;
      date = info.date;
      console.log(chalk.green(`✅ 已提取标题: ${title.slice(0, 50)}...\n`));
    } else if (options.topic) {
      // 使用命令行参数
      title = options.topic;
      subtitle = options.subtitle;
      author = options.author;
      date = new Date().toISOString().split('T')[0];
      console.log(chalk.blue(`使用指定主题: ${title}\n`));
    } else {
      console.error(chalk.red('\n❌ 请提供 Markdown 文件路径或使用 --topic 指定主题'));
      console.log(chalk.gray('\n示例:'));
      console.log(chalk.cyan('  dasheng generate-cover ./blog-post.md'));
      console.log(chalk.cyan('  dasheng generate-cover -t "大圣 1.0 发布" --style tech'));
      process.exit(1);
    }

    // 确定风格
    const style = (options.style as CoverStyle) || 'tech';
    
    // 确定输出路径
    const outputPath = options.output || `cover-${Date.now()}.png`;

    console.log(chalk.blue('封面配置:'));
    console.log(`   尺寸: ${chalk.cyan(sizeLabel)}`);
    console.log(`   风格: ${chalk.cyan(getStyleDisplayName(style))}`);
    
    // 显示自定义 prompt 信息（如果有）
    if (options.prompt) {
      console.log(`   提示词: ${chalk.magenta(options.prompt.slice(0, 50))}${options.prompt.length > 50 ? '...' : ''}`);
    }
    
    console.log(`   输出: ${chalk.cyan(outputPath)}\n`);

    // 生成封面
    console.log(chalk.yellow('正在绘制封面...'));

    const generateOptions: CoverGenerateOptions = {
      width,
      height,
      style,
      title,
      subtitle,
      author,
      date,
      prompt: options.prompt // 传递自定义 prompt
    };

    const result = await generator.generate(generateOptions, outputPath);

    // 输出结果
    console.log(chalk.green('\n✅ 画皮术神通施展完成！\n'));
    console.log(chalk.cyan('📄 生成信息:'));
    console.log(`   文件路径: ${chalk.green(result.outputPath)}`);
    console.log(`   图片尺寸: ${chalk.blue(`${result.width}x${result.height}`)}`);
    console.log(`   设计风格: ${chalk.yellow(getStyleDisplayName(result.style))}`);
    console.log();

    console.log(chalk.green('✨ 封面已生成，可直接用于博客文章！'));
    console.log();

  } catch (error) {
    console.error(chalk.red('\n❌ 错误:'), error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('canvas')) {
      console.log(chalk.gray('\n提示: 如果使用 Windows，可能需要安装 Canvas 依赖:'));
      console.log(chalk.cyan('  npm install canvas'));
    }
    
    process.exit(1);
  }
}

/**
 * 获取风格显示名称
 */
function getStyleDisplayName(style: CoverStyle): string {
  const names: Record<CoverStyle, string> = {
    'tech': '科技风',
    'minimal': '简约风',
    'gradient': '渐变风',
    'illustration': '插画风',
    'business': '商务风'
  };
  return names[style] || style;
}
