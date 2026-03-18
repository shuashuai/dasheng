/**
 * GenerateCoverScreen - 画皮术 (封面生成)
 * 交互式博客封面图生成
 */

import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '../components/TextInput.js';
import { Select } from '../components/Select.js';
import { Confirm } from '../components/Confirm.js';
import { Spinner } from '../components/Spinner.js';
import { Result } from '../components/Result.js';
import { generateCoverCommand } from '../../cli/commands/generate-cover.js';
import { existsSync } from 'fs';
import type { CoverStyle } from '../../types/index.js';

const STYLE_OPTIONS = [
  { label: '💻 科技风 (tech)', value: 'tech' },
  { label: '⚪ 简约风 (minimal)', value: 'minimal' },
  { label: '🌈 渐变风 (gradient)', value: 'gradient' },
  { label: '🎨 插画风 (illustration)', value: 'illustration' },
  { label: '💼 商务风 (business)', value: 'business' },
];

const RATIO_OPTIONS = [
  { label: '16:9 (横版 - 适合博客头图)', value: '16:9' },
  { label: '1:1 (正方形 - 适合社交媒体)', value: '1:1' },
  { label: '9:16 (竖版 - 适合小红书)', value: '9:16' },
  { label: '4:3 (标准比例)', value: '4:3' },
  { label: '21:9 (宽屏 - 适合视频封面)', value: '21:9' },
];

export function GenerateCoverScreen(): React.JSX.Element {
  const [step, setStep] = useState<'source' | 'file' | 'topic' | 'style' | 'ratio' | 'options' | 'subtitle' | 'author' | 'confirm' | 'running' | 'result'>('source');
  const [sourceType, setSourceType] = useState<'file' | 'topic'>('file');
  const [file, setFile] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<CoverStyle>('tech');
  const [ratio, setRatio] = useState('16:9');
  const [output, setOutput] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string[] } | null>(null);

  const handleSourceSelect = useCallback((value: string) => {
    setSourceType(value as 'file' | 'topic');
    setStep(value === 'file' ? 'file' : 'topic');
  }, []);

  const handleFileSubmit = useCallback((value: string) => {
    if (!existsSync(value)) {
      setResult({
        success: false,
        message: '文件不存在',
        details: [`路径: ${value}`, '请检查文件路径是否正确']
      });
      setStep('result');
      return;
    }
    setFile(value);
    setStep('style');
  }, []);

  const handleTopicSubmit = useCallback((value: string) => {
    if (!value.trim()) {
      setResult({
        success: false,
        message: '主题不能为空',
        details: ['请输入封面主题']
      });
      setStep('result');
      return;
    }
    setTopic(value);
    setStep('style');
  }, []);

  const handleStyleSelect = useCallback((value: string) => {
    setStyle(value as CoverStyle);
    setStep('ratio');
  }, []);

  const handleRatioSelect = useCallback((value: string) => {
    setRatio(value);
    setStep('options');
  }, []);

  const runGeneration = useCallback(async () => {
    try {
      const outputPath = output || `cover-${Date.now()}.png`;
      
      // 捕获控制台输出
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
      };

      await generateCoverCommand(
        sourceType === 'file' ? file : undefined,
        {
          style,
          ratio,
          output: outputPath,
          topic: sourceType === 'topic' ? topic : undefined,
          subtitle: subtitle || undefined,
          author: author || undefined,
        }
      );

      console.log = originalLog;

      setResult({
        success: true,
        message: '封面生成完成！',
        details: [
          `输出文件: ${outputPath}`,
          `设计风格: ${getStyleDisplayName(style)}`,
          `画面比例: ${ratio}`,
          sourceType === 'file' ? `源文件: ${file}` : `主题: ${topic}`,
          subtitle ? `副标题: ${subtitle}` : '',
          author ? `作者: ${author}` : '',
        ].filter(Boolean)
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '生成失败',
        details: ['请检查:', '- Canvas 依赖是否安装', '- 磁盘空间是否充足']
      });
    }
    setStep('result');
  }, [sourceType, file, topic, style, ratio, output, subtitle, author]);

  const reset = useCallback(() => {
    setSourceType('file');
    setFile('');
    setTopic('');
    setStyle('tech');
    setRatio('16:9');
    setOutput('');
    setSubtitle('');
    setAuthor('');
    setResult(null);
  }, []);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">🎨 画皮术 - 生成封面图</Text>
      <Text color="gray">根据博客内容或主题生成精美封面</Text>

      <Box marginTop={1} flexDirection="column" gap={1}>
        {step === 'source' && (
          <Select
            label="📄 选择内容来源"
            options={[
              { label: '📑 从 Markdown 文件提取', value: 'file' },
              { label: '✏️ 直接输入主题', value: 'topic' },
            ]}
            onSelect={handleSourceSelect}
          />
        )}

        {step === 'file' && (
          <TextInput
            label="📁 Markdown 文件路径"
            placeholder="./blog/post.md"
            onSubmit={handleFileSubmit}
          />
        )}

        {step === 'topic' && (
          <TextInput
            label="✏️ 封面主题"
            placeholder="例如: React 19 新特性解析"
            onSubmit={handleTopicSubmit}
          />
        )}

        {step === 'style' && (
          <Select
            label="🎨 选择封面风格"
            options={STYLE_OPTIONS}
            onSelect={handleStyleSelect}
          />
        )}

        {step === 'ratio' && (
          <Select
            label="📐 选择画面比例"
            options={RATIO_OPTIONS}
            onSelect={handleRatioSelect}
          />
        )}

        {step === 'options' && (
          <Box flexDirection="column" gap={1}>
            <Text bold>⚙️ 可选配置</Text>
            
            <Box flexDirection="column" gap={1}>
              <TextInput
                label="💾 输出文件路径 (可选)"
                placeholder={`cover-${Date.now()}.png`}
                onSubmit={(value) => {
                  setOutput(value);
                  setStep('subtitle');
                }}
              />
            </Box>
          </Box>
        )}

        {step === 'subtitle' && (
          <Box flexDirection="column" gap={1}>
            <TextInput
              label="📌 副标题 (可选，按 Enter 跳过)"
              placeholder="输入副标题..."
              onSubmit={(value) => {
                setSubtitle(value);
                setStep('author');
              }}
            />
          </Box>
        )}

        {step === 'author' && (
          <Box flexDirection="column" gap={1}>
            <TextInput
              label="👤 作者名称 (可选，按 Enter 跳过)"
              placeholder="输入作者名..."
              onSubmit={(value) => {
                setAuthor(value);
                setStep('confirm');
              }}
            />
          </Box>
        )}

        {step === 'confirm' && (
          <Box flexDirection="column" gap={1}>
            <Text bold>📋 确认配置</Text>
            <Box flexDirection="column" paddingLeft={2} borderStyle="single" borderColor="gray" padding={1}>
              <Text>来源: {sourceType === 'file' ? `文件 (${file})` : `主题 (${topic})`}</Text>
              <Text>风格: {getStyleDisplayName(style)}</Text>
              <Text>比例: {ratio}</Text>
              <Text>输出: {output || `cover-${Date.now()}.png`}</Text>
              {subtitle && <Text>副标题: {subtitle}</Text>}
              {author && <Text>作者: {author}</Text>}
            </Box>
            <Confirm
              label="确认开始生成?"
              defaultValue={true}
              onConfirm={(value) => {
                if (value) {
                  setStep('running');
                  setTimeout(runGeneration, 100);
                } else {
                  setStep('options');
                }
              }}
            />
          </Box>
        )}

        {step === 'running' && (
          <Box flexDirection="column" gap={1}>
            <Spinner text="正在绘制封面..." />
            <Text color="gray">Canvas 正在渲染，请稍候...</Text>
          </Box>
        )}

        {step === 'result' && result && (
          <Box flexDirection="column" gap={1}>
            <Result
              success={result.success}
              message={result.message}
              details={result.details}
            />
            <Box marginTop={1}>
              <Confirm
                label="是否重新生成?"
                defaultValue={true}
                onConfirm={(value) => {
                  if (value) {
                    reset();
                    setStep('source');
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function getStyleDisplayName(style: CoverStyle): string {
  const names: Record<CoverStyle, string> = {
    tech: '科技风',
    minimal: '简约风',
    gradient: '渐变风',
    illustration: '插画风',
    business: '商务风',
  };
  return names[style] || style;
}
