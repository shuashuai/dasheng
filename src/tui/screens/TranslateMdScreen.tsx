/**
 * TranslateMdScreen - 译真经 (Markdown 翻译)
 * 交互式 Markdown 文件翻译
 */

import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '../components/TextInput.js';
import { Select } from '../components/Select.js';
import { Confirm } from '../components/Confirm.js';
import { Spinner } from '../components/Spinner.js';
import { Result } from '../components/Result.js';
import { translateMdCommand } from '../../cli/commands/translate-md.js';
import { existsSync } from 'fs';

const LANG_OPTIONS = [
  { label: '简体中文 (zh-CN)', value: 'zh-CN' },
  { label: '繁体中文 (zh-TW)', value: 'zh-TW' },
  { label: '英语 (en-US)', value: 'en-US' },
  { label: '日语 (ja-JP)', value: 'ja-JP' },
  { label: '韩语 (ko-KR)', value: 'ko-KR' },
  { label: '法语 (fr-FR)', value: 'fr-FR' },
  { label: '德语 (de-DE)', value: 'de-DE' },
  { label: '西班牙语 (es-ES)', value: 'es-ES' },
];

export function TranslateMdScreen(): React.JSX.Element {
  const [step, setStep] = useState<'file' | 'lang' | 'output' | 'frontmatter' | 'running' | 'result'>('file');
  const [file, setFile] = useState('');
  const [targetLang, setTargetLang] = useState('zh-CN');
  const [output, setOutput] = useState('');
  const [keepFrontmatter, setKeepFrontmatter] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string[] } | null>(null);

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
    setStep('lang');
  }, []);

  const handleLangSelect = useCallback((value: string) => {
    setTargetLang(value);
    setStep('output');
  }, []);

  const handleOutputSubmit = useCallback((value: string) => {
    setOutput(value);
    setStep('frontmatter');
  }, []);

  const runTranslation = useCallback(async () => {
    try {
      // 捕获控制台输出
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
      };

      await translateMdCommand(file, {
        targetLang,
        output: output || undefined,
        keepFrontmatter,
      });

      console.log = originalLog;

      const defaultOutput = file.replace('.md', `-${targetLang}.md`);
      setResult({
        success: true,
        message: '翻译完成！',
        details: [
          `源文件: ${file}`,
          `目标语言: ${targetLang}`,
          `输出文件: ${output || defaultOutput}`,
          `保护 frontMatter: ${keepFrontmatter ? '是' : '否'}`,
          '',
          '详细日志请查看上方输出',
        ]
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '翻译失败',
        details: ['请检查:', '- API Key 是否设置', '- 文件路径是否正确', '- 网络连接是否正常']
      });
    }
    setStep('result');
  }, [file, targetLang, output, keepFrontmatter]);

  const reset = useCallback(() => {
    setFile('');
    setTargetLang('zh-CN');
    setOutput('');
    setKeepFrontmatter(true);
    setResult(null);
  }, []);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">📝 译真经 - Markdown 翻译</Text>
      <Text color="gray">智能翻译 Markdown，保护 frontMatter 格式</Text>

      <Box marginTop={1} flexDirection="column" gap={1}>
        {step === 'file' && (
          <TextInput
            label="📁 Markdown 文件路径"
            placeholder="./blog/post.md"
            onSubmit={handleFileSubmit}
          />
        )}

        {step === 'lang' && (
          <Select
            label="🌍 选择目标语言"
            options={LANG_OPTIONS}
            onSelect={handleLangSelect}
          />
        )}

        {step === 'output' && (
          <Box flexDirection="column" gap={1}>
            <TextInput
              label="📂 输出文件路径 (可选，留空则自动命名)"
              placeholder={`${file.replace('.md', `-${targetLang}.md`)}`}
              onSubmit={handleOutputSubmit}
            />
          </Box>
        )}

        {step === 'frontmatter' && (
          <Confirm
            label="保持 frontMatter 格式不变?"
            defaultValue={true}
            onConfirm={(value) => {
              setKeepFrontmatter(value);
              setStep('running');
              // 使用 setTimeout 让 UI 先渲染
              setTimeout(runTranslation, 100);
            }}
          />
        )}

        {step === 'running' && (
          <Box flexDirection="column" gap={1}>
            <Spinner text="正在翻译 Markdown..." />
            <Text color="gray">AI 正在翻译内容，请稍候...</Text>
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
                label="是否重新开始?"
                defaultValue={true}
                onConfirm={(value) => {
                  if (value) {
                    reset();
                    setStep('file');
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
