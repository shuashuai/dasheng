/**
 * TranslateYamlScreen - 语言通 (YAML 翻译)
 * 交互式 YAML 多语言文件翻译
 */

import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '../components/TextInput.js';
import { Select } from '../components/Select.js';
import { Confirm } from '../components/Confirm.js';
import { Spinner } from '../components/Spinner.js';
import { Result } from '../components/Result.js';
import { translateYamlCommand } from '../../cli/commands/translate-yaml.js';
import { existsSync } from 'fs';

const LANG_OPTIONS = [
  { label: '简体中文 (zh-CN)', value: 'zh-CN' },
  { label: '繁体中文 (zh-TW)', value: 'zh-TW' },
  { label: '日语 (ja-JP)', value: 'ja-JP' },
  { label: '韩语 (ko-KR)', value: 'ko-KR' },
  { label: '法语 (fr-FR)', value: 'fr-FR' },
  { label: '德语 (de-DE)', value: 'de-DE' },
  { label: '西班牙语 (es-ES)', value: 'es-ES' },
  { label: '全部语言', value: 'all' },
];

export function TranslateYamlScreen(): React.JSX.Element {
  const [step, setStep] = useState<'file' | 'target' | 'lang' | 'options' | 'force' | 'confirm' | 'running' | 'result'>('file');
  const [file, setFile] = useState('');
  const [targetDir, setTargetDir] = useState('./locales/');
  const [lang, setLang] = useState('zh-CN');
  const [dryRun, setDryRun] = useState(true);
  const [force, setForce] = useState(false);
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
    setStep('target');
  }, []);

  const handleTargetSubmit = useCallback((value: string) => {
    setTargetDir(value || './locales/');
    setStep('lang');
  }, []);

  const handleLangSelect = useCallback((value: string) => {
    setLang(value);
    setStep('options');
  }, []);

  const handleOptionsConfirm = useCallback((confirmed: boolean) => {
    if (confirmed) {
      setStep('running');
      runTranslation();
    } else {
      setStep('file');
      reset();
    }
  }, []);

  const runTranslation = useCallback(async () => {
    try {
      const langs = lang === 'all' 
        ? ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES']
        : [lang];

      // 捕获控制台输出
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
      };

      await translateYamlCommand(file, {
        target: targetDir,
        lang: langs,
        dryRun,
        force,
      });

      console.log = originalLog;

      setResult({
        success: true,
        message: dryRun ? '试演完成！' : '翻译完成！',
        details: [
          `基础文件: ${file}`,
          `目标目录: ${targetDir}`,
          `目标语言: ${langs.join(', ')}`,
          dryRun ? '模式: 试演（未实际修改文件）' : '模式: 真实翻译',
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
  }, [file, targetDir, lang, dryRun, force]);

  const reset = useCallback(() => {
    setFile('');
    setTargetDir('./locales/');
    setLang('zh-CN');
    setDryRun(true);
    setForce(false);
    setResult(null);
  }, []);

  const handleRestart = useCallback(() => {
    reset();
    setStep('file');
  }, [reset]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">🌐 语言通 - YAML 多语言翻译</Text>
      <Text color="gray">自动同步翻译 YAML 国际化文件</Text>

      <Box marginTop={1} flexDirection="column" gap={1}>
        {step === 'file' && (
          <TextInput
            label="📁 基础语言文件路径 (如: ./locales/en.yaml)"
            placeholder="./locales/en.yaml"
            onSubmit={handleFileSubmit}
          />
        )}

        {step === 'target' && (
          <TextInput
            label="📂 目标语言文件目录"
            placeholder="./locales/"
            defaultValue="./locales/"
            onSubmit={handleTargetSubmit}
          />
        )}

        {step === 'lang' && (
          <Select
            label="🌍 选择目标语言"
            options={LANG_OPTIONS}
            onSelect={handleLangSelect}
          />
        )}

        {step === 'options' && (
          <Confirm
            label="试演模式 (dry-run)? 预览但不实际修改文件"
            defaultValue={true}
            onConfirm={(value) => {
              setDryRun(value);
              setStep('force');
            }}
          />
        )}

        {step === 'force' && (
          <Confirm
            label="强制重译 (force)? 重新翻译已存在的 key"
            defaultValue={false}
            onConfirm={(value) => {
              setForce(value);
              setStep('confirm');
            }}
          />
        )}

        {step === 'confirm' && (
          <Box flexDirection="column" gap={1}>
            <Text bold>📋 确认配置</Text>
            <Box flexDirection="column" paddingLeft={2} borderStyle="single" borderColor="gray" padding={1}>
              <Text>文件: {file}</Text>
              <Text>目录: {targetDir}</Text>
              <Text>语言: {lang === 'all' ? '全部' : lang}</Text>
              <Text>试演: {dryRun ? '是' : '否'}</Text>
              <Text>强制: {force ? '是' : '否'}</Text>
            </Box>
            <Confirm
              label="确认开始?"
              defaultValue={true}
              onConfirm={handleOptionsConfirm}
            />
          </Box>
        )}

        {step === 'running' && (
          <Box flexDirection="column" gap={1}>
            <Spinner text={dryRun ? "正在试演分析..." : "正在翻译中..."} />
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
                label="是否重新开始?"
                defaultValue={true}
                onConfirm={(value) => {
                  if (value) handleRestart();
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
