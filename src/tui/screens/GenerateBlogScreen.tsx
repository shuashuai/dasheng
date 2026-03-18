/**
 * GenerateBlogScreen - 妙笔生花 (博客生成)
 * 交互式技术博客生成
 */

import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '../components/TextInput.js';
import { Select } from '../components/Select.js';
import { Confirm } from '../components/Confirm.js';
import { Spinner } from '../components/Spinner.js';
import { Result } from '../components/Result.js';
import { generateBlogCommand } from '../../cli/commands/generate-blog.js';
import { existsSync } from 'fs';
import type { BlogStyle } from '../../types/index.js';

const STYLE_OPTIONS = [
  { label: '📦 版本发布 (release)', value: 'release' },
  { label: '📚 教程指南 (tutorial)', value: 'tutorial' },
  { label: '📰 新闻资讯 (news)', value: 'news' },
  { label: '🔍 深度分析 (deep-dive)', value: 'deep-dive' },
  { label: '📖 故事叙述 (story)', value: 'story' },
];

const AUDIENCE_OPTIONS = [
  { label: '初级开发者', value: 'beginner' },
  { label: '中级开发者', value: 'intermediate' },
  { label: '高级开发者', value: 'advanced' },
  { label: '架构师', value: 'architect' },
  { label: '全栈开发者', value: 'fullstack' },
  { label: '产品经理', value: 'pm' },
];

export function GenerateBlogScreen(): React.JSX.Element {
  const [step, setStep] = useState<'source' | 'file' | 'topic' | 'points' | 'style' | 'audience' | 'output' | 'confirm' | 'running' | 'result'>('source');
  const [sourceType, setSourceType] = useState<'file' | 'topic'>('topic');
  const [file, setFile] = useState('');
  const [topic, setTopic] = useState('');
  const [points, setPoints] = useState('');
  const [style, setStyle] = useState<BlogStyle>('tutorial');
  const [audience, setAudience] = useState('intermediate');
  const [output, setOutput] = useState('');
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
        details: ['请输入博客主题']
      });
      setStep('result');
      return;
    }
    setTopic(value);
    setStep('points');
  }, []);

  const handlePointsSubmit = useCallback((value: string) => {
    setPoints(value);
    setStep('style');
  }, []);

  const handleStyleSelect = useCallback((value: string) => {
    setStyle(value as BlogStyle);
    setStep('audience');
  }, []);

  const handleAudienceSelect = useCallback((value: string) => {
    setAudience(value);
    setStep('output');
  }, []);

  const runGeneration = useCallback(async () => {
    try {
      const outputPath = output || undefined;
      
      // 捕获控制台输出
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
      };

      await generateBlogCommand(
        sourceType === 'file' ? file : undefined,
        {
          style,
          topic: sourceType === 'topic' ? topic : undefined,
          points: points || undefined,
          audience,
          output: outputPath,
        }
      );

      console.log = originalLog;

      const finalOutput = output || `blog-post-${Date.now()}.md`;
      setResult({
        success: true,
        message: '博客生成完成！',
        details: [
          `输出文件: ${finalOutput}`,
          `博客风格: ${getStyleDisplayName(style)}`,
          `目标读者: ${getAudienceDisplayName(audience)}`,
          sourceType === 'file' ? `源文件: ${file}` : `主题: ${topic}`,
          points ? `关键要点: ${points}` : '',
        ].filter(Boolean)
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '生成失败',
        details: ['请检查:', '- API Key 是否设置', '- 网络连接是否正常']
      });
    }
    setStep('result');
  }, [sourceType, file, topic, points, style, audience, output]);

  const reset = useCallback(() => {
    setSourceType('topic');
    setFile('');
    setTopic('');
    setPoints('');
    setStyle('tutorial');
    setAudience('intermediate');
    setOutput('');
    setResult(null);
  }, []);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">✍️ 妙笔生花 - 生成技术博客</Text>
      <Text color="gray">AI 辅助生成高质量技术博客文章</Text>

      <Box marginTop={1} flexDirection="column" gap={1}>
        {step === 'source' && (
          <Select
            label="📄 选择内容来源"
            options={[
              { label: '📑 从 Release Notes 文件', value: 'file' },
              { label: '✏️ 直接输入主题和要点', value: 'topic' },
            ]}
            onSelect={handleSourceSelect}
          />
        )}

        {step === 'file' && (
          <TextInput
            label="📁 Release Notes 文件路径"
            placeholder="./RELEASE_NOTES.md"
            onSubmit={handleFileSubmit}
          />
        )}

        {step === 'topic' && (
          <TextInput
            label="✏️ 博客主题"
            placeholder="例如: React 19 新特性解析"
            onSubmit={handleTopicSubmit}
          />
        )}

        {step === 'points' && (
          <TextInput
            label="📝 关键要点 (用逗号分隔，可选)"
            placeholder="并发渲染, Server Components, Actions..."
            onSubmit={handlePointsSubmit}
          />
        )}

        {step === 'style' && (
          <Select
            label="🎨 选择博客风格"
            options={STYLE_OPTIONS}
            onSelect={handleStyleSelect}
          />
        )}

        {step === 'audience' && (
          <Select
            label="👥 选择目标读者"
            options={AUDIENCE_OPTIONS}
            onSelect={handleAudienceSelect}
          />
        )}

        {step === 'output' && (
          <Box flexDirection="column" gap={1}>
            <TextInput
              label="💾 输出文件路径 (可选，按 Enter 使用默认)"
              placeholder={`blog-post-${Date.now()}.md`}
              onSubmit={(value) => {
                setOutput(value);
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
              {points && <Text>要点: {points}</Text>}
              <Text>风格: {getStyleDisplayName(style)}</Text>
              <Text>读者: {getAudienceDisplayName(audience)}</Text>
              <Text>输出: {output || `blog-post-${Date.now()}.md`}</Text>
            </Box>
            <Confirm
              label="确认开始生成?"
              defaultValue={true}
              onConfirm={(value) => {
                if (value) {
                  setStep('running');
                  setTimeout(runGeneration, 100);
                } else {
                  setStep('source');
                  reset();
                }
              }}
            />
          </Box>
        )}

        {step === 'running' && (
          <Box flexDirection="column" gap={1}>
            <Spinner text="AI 正在创作博客..." />
            <Text color="gray">这可能需要一些时间，请耐心等待...</Text>
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

function getStyleDisplayName(style: BlogStyle): string {
  const names: Record<BlogStyle, string> = {
    release: '版本发布',
    tutorial: '教程指南',
    news: '新闻资讯',
    'deep-dive': '深度分析',
    story: '故事叙述',
  };
  return names[style] || style;
}

function getAudienceDisplayName(audience: string): string {
  const names: Record<string, string> = {
    beginner: '初级开发者',
    intermediate: '中级开发者',
    advanced: '高级开发者',
    architect: '架构师',
    fullstack: '全栈开发者',
    pm: '产品经理',
  };
  return names[audience] || audience;
}
