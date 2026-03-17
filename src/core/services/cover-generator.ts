// 🎨 七十二变·画皮术 - 封面生成服务（增强版）

import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { CoverStyle } from '../../types/index.js';
import matter from 'gray-matter';

export interface CoverGenerateOptions {
  width: number;
  height: number;
  style: CoverStyle;
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  prompt?: string; // 自定义 AI 提示词（可用于未来的 AI 图片生成）
}

export interface CoverGenerateResult {
  outputPath: string;
  width: number;
  height: number;
  style: CoverStyle;
}

/**
 * 封面生成器（增强版）
 * 丰富的背景效果：纹理、渐变、几何图案
 */
export class CoverGenerator {
  private canvas: Canvas | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  /**
   * 从 Markdown 文件提取信息
   */
  extractFromMarkdown(filePath: string): { title: string; subtitle?: string; author?: string; date?: string } {
    if (!existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    const parsed = matter(content);
    
    return {
      title: parsed.data.title || parsed.data.headline || this.extractFirstLine(parsed.content),
      subtitle: parsed.data.excerpt || parsed.data.description,
      author: parsed.data.author,
      date: parsed.data.date
    };
  }

  /**
   * 提取第一行作为标题
   */
  private extractFirstLine(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed.replace(/^#+\s*/, '').slice(0, 50);
      }
    }
    return '未命名文章';
  }

  /**
   * 解析比例
   */
  parseRatio(ratio: string): { width: number; height: number } {
    const ratios: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '1:1': { width: 1200, height: 1200 },
      '9:16': { width: 1080, height: 1920 },
      '4:3': { width: 1600, height: 1200 },
      '21:9': { width: 2560, height: 1080 },
      '3:2': { width: 1800, height: 1200 }
    };
    return ratios[ratio] || ratios['16:9'];
  }

  /**
   * 生成封面
   */
  async generate(options: CoverGenerateOptions, outputPath: string): Promise<CoverGenerateResult> {
    const { width, height, style } = options;
    
    // 创建画布
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');

    // 应用风格
    switch (style) {
      case 'tech':
        await this.drawTechStyle(options);
        break;
      case 'minimal':
        await this.drawMinimalStyle(options);
        break;
      case 'gradient':
        await this.drawGradientStyle(options);
        break;
      case 'illustration':
        await this.drawIllustrationStyle(options);
        break;
      case 'business':
        await this.drawBusinessStyle(options);
        break;
      default:
        await this.drawTechStyle(options);
    }

    // 确保输出目录存在
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // 保存图片
    const buffer = this.canvas.toBuffer('image/png');
    writeFileSync(outputPath, buffer);

    return {
      outputPath,
      width,
      height,
      style
    };
  }

  // ==================== 背景装饰方法 ====================

  /**
   * 绘制噪点纹理
   */
  private drawNoise(width: number, height: number, opacity: number = 0.03): void {
    const ctx = this.ctx!;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() > 0.5) {
        const noise = (Math.random() - 0.5) * 50 * opacity;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 绘制网格背景
   */
  private drawGrid(width: number, height: number, color: string = 'rgba(255,255,255,0.03)', size: number = 40): void {
    const ctx = this.ctx!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * 绘制波浪线条
   */
  private drawWaves(width: number, height: number, color: string, count: number = 5): void {
    const ctx = this.ctx!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      const y = height * (0.3 + i * 0.1);
      const amplitude = 20 + i * 10;
      const frequency = 0.01 + i * 0.002;
      
      for (let x = 0; x <= width; x += 5) {
        const yOffset = Math.sin(x * frequency + i) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y + yOffset);
        } else {
          ctx.lineTo(x, y + yOffset);
        }
      }
      ctx.stroke();
    }
  }

  /**
   * 绘制发光效果
   */
  private drawGlow(x: number, y: number, radius: number, color: string): void {
    const ctx = this.ctx!;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  /**
   * 绘制斜线纹理
   */
  private drawDiagonalLines(width: number, height: number, color: string = 'rgba(255,255,255,0.03)'): void {
    const ctx = this.ctx!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    for (let i = -height; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
  }

  // ==================== 风格绘制方法 ====================

  /**
   * 科技风 - 深蓝紫渐变 + 丰富装饰
   */
  private async drawTechStyle(options: CoverGenerateOptions): Promise<void> {
    const { width, height, title, subtitle, author, date } = options;
    const ctx = this.ctx!;

    // 1. 动态渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0f1c');
    gradient.addColorStop(0.3, '#1a1b4b');
    gradient.addColorStop(0.6, '#2d1b69');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. 添加发光效果
    this.drawGlow(width * 0.2, height * 0.3, 400, 'rgba(99, 102, 241, 0.15)');
    this.drawGlow(width * 0.8, height * 0.7, 350, 'rgba(139, 92, 246, 0.12)');
    this.drawGlow(width * 0.5, height * 0.5, 300, 'rgba(168, 85, 247, 0.08)');

    // 3. 网格背景
    this.drawGrid(width, height, 'rgba(99, 102, 241, 0.04)', 50);

    // 4. 波浪线条
    this.drawWaves(width, height, 'rgba(99, 102, 241, 0.1)', 4);

    // 5. 几何装饰圆
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(width * 0.15 + i * 50, height * 0.2 + i * 30, 80 + i * 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(width * 0.85 - i * 40, height * 0.8 - i * 20, 60 + i * 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. 噪点纹理
    this.drawNoise(width, height, 0.02);

    // 7. 标题卡片背景
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(width * 0.1, height * 0.35, width * 0.8, height * 0.35);

    // 8. 文字
    ctx.textAlign = 'center';
    
    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    this.wrapText(ctx, title, width / 2, height * 0.48, width * 0.75, 90);

    // 副标题
    if (subtitle) {
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '36px Arial';
      this.wrapText(ctx, subtitle, width / 2, height * 0.62, width * 0.7, 50);
    }

    // 作者和日期
    ctx.fillStyle = '#818cf8';
    ctx.font = '28px Arial';
    const info = [author, date].filter(Boolean).join(' · ');
    if (info) {
      ctx.fillText(info, width / 2, height * 0.85);
    }

    // 9. 显示自定义 prompt（如果有）
    if (options.prompt) {
      ctx.fillStyle = 'rgba(129, 140, 248, 0.6)';
      ctx.font = '16px Arial';
      ctx.textAlign = 'right';
      const promptText = `Prompt: ${options.prompt.slice(0, 60)}${options.prompt.length > 60 ? '...' : ''}`;
      ctx.fillText(promptText, width - 20, height - 20);
      ctx.textAlign = 'center';
    }

    // 10. 底部渐变条
    const barGradient = ctx.createLinearGradient(0, 0, width, 0);
    barGradient.addColorStop(0, '#6366f1');
    barGradient.addColorStop(0.5, '#8b5cf6');
    barGradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = barGradient;
    ctx.fillRect(0, height - 6, width, 6);
  }

  /**
   * 简约风 - 优雅极简 + 细微纹理
   */
  private async drawMinimalStyle(options: CoverGenerateOptions): Promise<void> {
    const { width, height, title, subtitle, author, date } = options;
    const ctx = this.ctx!;

    // 1. 米白背景（不是纯白，更有质感）
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);

    // 2. 极细微噪点
    this.drawNoise(width, height, 0.015);

    // 3. 斜线纹理（很淡）
    this.drawDiagonalLines(width, height, 'rgba(0,0,0,0.015)');

    // 4. 装饰性几何
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    
    // 左上角装饰
    ctx.beginPath();
    ctx.moveTo(60, 150);
    ctx.lineTo(60, 60);
    ctx.lineTo(150, 60);
    ctx.stroke();
    
    // 右下角装饰
    ctx.beginPath();
    ctx.moveTo(width - 60, height - 150);
    ctx.lineTo(width - 60, height - 60);
    ctx.lineTo(width - 150, height - 60);
    ctx.stroke();

    // 5. 文字区域
    ctx.textAlign = 'center';
    
    // 标题
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 84px Arial';
    this.wrapText(ctx, title, width / 2, height * 0.42, width * 0.7, 100);

    // 分隔线
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, height * 0.58);
    ctx.lineTo(width / 2 + 80, height * 0.58);
    ctx.stroke();

    // 副标题
    if (subtitle) {
      ctx.fillStyle = '#78716c';
      ctx.font = '32px Arial';
      this.wrapText(ctx, subtitle, width / 2, height * 0.65, width * 0.6, 45);
    }

    // 作者和日期
    ctx.fillStyle = '#a8a29e';
    ctx.font = '24px Arial';
    const info = [author, date].filter(Boolean).join(' · ');
    if (info) {
      ctx.fillText(info, width / 2, height * 0.78);
    }

    // 显示自定义 prompt（如果有）
    if (options.prompt) {
      ctx.fillStyle = 'rgba(168, 162, 158, 0.5)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      const promptText = `Prompt: ${options.prompt.slice(0, 50)}${options.prompt.length > 50 ? '...' : ''}`;
      ctx.fillText(promptText, width - 30, height - 30);
    }
  }

  /**
   * 渐变风 - 多彩流体 + 动态效果
   */
  private async drawGradientStyle(options: CoverGenerateOptions): Promise<void> {
    const { width, height, title, subtitle, author, date } = options;
    const ctx = this.ctx!;

    // 1. 多层渐变背景
    const gradient1 = ctx.createRadialGradient(0, 0, 0, width, height, width * 1.5);
    gradient1.addColorStop(0, '#ff6b6b');
    gradient1.addColorStop(0.3, '#feca57');
    gradient1.addColorStop(0.6, '#48dbfb');
    gradient1.addColorStop(1, '#ff9ff3');
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, width, height);

    // 2. 第二层渐变叠加
    const gradient2 = ctx.createRadialGradient(width, 0, 0, width, height, width);
    gradient2.addColorStop(0, 'rgba(255, 159, 243, 0.5)');
    gradient2.addColorStop(0.5, 'rgba(72, 219, 251, 0.3)');
    gradient2.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, width, height);

    // 3. 波浪形状
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * (0.6 + i * 0.1));
      for (let x = 0; x <= width; x += 10) {
        const y = Math.sin(x * 0.01 + i * 2) * 30;
        ctx.lineTo(x, height * (0.6 + i * 0.1) + y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();
    }

    // 4. 圆形装饰
    const circles = [
      { x: 0.2, y: 0.2, r: 100, color: 'rgba(255,255,255,0.2)' },
      { x: 0.8, y: 0.3, r: 150, color: 'rgba(255,255,255,0.15)' },
      { x: 0.3, y: 0.8, r: 120, color: 'rgba(255,255,255,0.1)' },
      { x: 0.7, y: 0.7, r: 80, color: 'rgba(255,255,255,0.18)' }
    ];
    
    for (const c of circles) {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(width * c.x, height * c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. 噪点
    this.drawNoise(width, height, 0.02);

    // 6. 文字卡片（毛玻璃效果）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(width * 0.1, height * 0.3, width * 0.8, height * 0.4);

    // 7. 文字
    ctx.textAlign = 'center';
    
    // 标题
    ctx.fillStyle = '#2d3436';
    ctx.font = 'bold 68px Arial';
    this.wrapText(ctx, title, width / 2, height * 0.48, width * 0.7, 85);

    // 副标题
    if (subtitle) {
      ctx.fillStyle = '#636e72';
      ctx.font = '32px Arial';
      this.wrapText(ctx, subtitle, width / 2, height * 0.6, width * 0.6, 45);
    }

    // 作者和日期
    ctx.fillStyle = '#b2bec3';
    ctx.font = '26px Arial';
    const info = [author, date].filter(Boolean).join(' · ');
    if (info) {
      ctx.fillText(info, width / 2, height * 0.68);
    }

    // 显示自定义 prompt（如果有）
    if (options.prompt) {
      ctx.fillStyle = 'rgba(99, 110, 114, 0.5)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      const promptText = `Prompt: ${options.prompt.slice(0, 50)}${options.prompt.length > 50 ? '...' : ''}`;
      ctx.fillText(promptText, width - 20, height - 20);
    }
  }

  /**
   * 插画风 - 手绘温暖 + 丰富元素
   */
  private async drawIllustrationStyle(options: CoverGenerateOptions): Promise<void> {
    const { width, height, title, subtitle, author, date } = options;
    const ctx = this.ctx!;

    // 1. 温暖背景色
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, width, height);

    // 2. 手绘风格色块
    const shapes = [
      { x: 0.1, y: 0.1, color: 'rgba(251, 146, 60, 0.2)', size: 150 },
      { x: 0.85, y: 0.15, color: 'rgba(52, 211, 153, 0.2)', size: 120 },
      { x: 0.2, y: 0.85, color: 'rgba(96, 165, 250, 0.2)', size: 180 },
      { x: 0.8, y: 0.8, color: 'rgba(167, 139, 250, 0.2)', size: 140 },
      { x: 0.5, y: 0.2, color: 'rgba(244, 114, 182, 0.15)', size: 100 }
    ];

    for (const s of shapes) {
      ctx.fillStyle = s.color;
      this.drawOrganicBlob(ctx, width * s.x, height * s.y, s.size);
    }

    // 3. 手绘圆圈
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'];
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 15 + Math.random() * 40;
      
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 2 + Math.random() * 2;
      ctx.globalAlpha = 0.3;
      
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
        const radius = r + (Math.random() - 0.5) * 8;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (angle === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 4. 小星星/点装饰
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 2 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. 文字卡片
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillRect(width * 0.12, height * 0.32, width * 0.76, height * 0.36);
    ctx.shadowColor = 'transparent';

    // 6. 文字
    ctx.textAlign = 'center';
    
    // 标题
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 64px Arial';
    this.wrapText(ctx, title, width / 2, height * 0.5, width * 0.65, 80);

    // 副标题
    if (subtitle) {
      ctx.fillStyle = '#4b5563';
      ctx.font = '30px Arial';
      this.wrapText(ctx, subtitle, width / 2, height * 0.62, width * 0.6, 42);
    }

    // 作者和日期
    ctx.fillStyle = '#9ca3af';
    ctx.font = '24px Arial';
    const info = [author, date].filter(Boolean).join(' · ');
    if (info) {
      ctx.fillText(info, width / 2, height * 0.75);
    }

    // 显示自定义 prompt（如果有）
    if (options.prompt) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      const promptText = `Prompt: ${options.prompt.slice(0, 50)}${options.prompt.length > 50 ? '...' : ''}`;
      ctx.fillText(promptText, width - 20, height - 20);
    }
  }

  /**
   * 商务风 - 深色专业 + 金色点缀
   */
  private async drawBusinessStyle(options: CoverGenerateOptions): Promise<void> {
    const { width, height, title, subtitle, author, date } = options;
    const ctx = this.ctx!;

    // 1. 深色背景
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, width, height);

    // 2. 暗纹背景
    this.drawDiagonalLines(width, height, 'rgba(255,255,255,0.015)');

    // 3. 金色渐变装饰条
    const goldGradient = ctx.createLinearGradient(0, 0, width, 0);
    goldGradient.addColorStop(0, 'transparent');
    goldGradient.addColorStop(0.5, 'rgba(202, 138, 4, 0.3)');
    goldGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = goldGradient;
    ctx.fillRect(0, height * 0.12, width, 3);
    ctx.fillRect(0, height * 0.88, width, 3);

    // 4. 几何装饰
    ctx.strokeStyle = 'rgba(202, 138, 4, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(
        40 + i * 25,
        40 + i * 20,
        120 - i * 15,
        80 - i * 10
      );
    }
    
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(
        width - 160 + i * 25,
        height - 120 + i * 20,
        120 - i * 15,
        80 - i * 10
      );
    }

    // 5. 点阵装饰
    ctx.fillStyle = 'rgba(202, 138, 4, 0.2)';
    for (let x = width - 200; x < width - 40; x += 20) {
      for (let y = 60; y < 200; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. 文字
    ctx.textAlign = 'center';
    
    // 标题
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 76px Arial';
    this.wrapText(ctx, title, width / 2, height * 0.45, width * 0.75, 95);

    // 副标题
    if (subtitle) {
      ctx.fillStyle = '#a8a29e';
      ctx.font = '34px Arial';
      this.wrapText(ctx, subtitle, width / 2, height * 0.58, width * 0.7, 50);
    }

    // 分隔装饰
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 60, height * 0.68);
    ctx.lineTo(width / 2 + 60, height * 0.68);
    ctx.stroke();

    // 作者和日期
    ctx.fillStyle = '#57534e';
    ctx.font = '26px Arial';
    const info = [author, date].filter(Boolean).join(' · ');
    if (info) {
      ctx.fillText(info, width / 2, height * 0.75);
    }

    // 显示自定义 prompt（如果有）
    if (options.prompt) {
      ctx.fillStyle = 'rgba(87, 83, 78, 0.6)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      const promptText = `Prompt: ${options.prompt.slice(0, 50)}${options.prompt.length > 50 ? '...' : ''}`;
      ctx.fillText(promptText, width - 20, height - 20);
    }
  }

  /**
   * 绘制有机形状（手绘风格）
   */
  private drawOrganicBlob(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = size * (0.7 + Math.random() * 0.6);
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else {
        const prevAngle = ((i - 1) / points) * Math.PI * 2;
        const cpx1 = x + Math.cos(prevAngle + 0.3) * radius * 1.2;
        const cpy1 = y + Math.sin(prevAngle + 0.3) * radius * 1.2;
        const cpx2 = x + Math.cos(angle - 0.3) * radius * 1.2;
        const cpy2 = y + Math.sin(angle - 0.3) * radius * 1.2;
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, px, py);
      }
    }
    ctx.fill();
  }

  /**
   * 自动换行文本
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth) {
      ctx.fillText(text, x, y);
      return y;
    }
    
    const chars = text.split('');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const testMetrics = ctx.measureText(testLine);
      
      if (testMetrics.width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, currentY);
        line = chars[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      ctx.fillText(line, x, currentY);
    }
    
    return currentY;
  }
}
