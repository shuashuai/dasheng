// 📜 紧箍咒·特殊词汇表工具

import type { ContextMap } from '../../types/index.js';
import { readFileSync } from 'fs';

/**
 * 加载 Context Map 配置文件
 */
export function loadContextMap(filePath: string): ContextMap {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as ContextMap;
  } catch (error) {
    console.warn(`加载 Context Map 失败: ${filePath}`, error);
    return { exact: {}, pattern: {} };
  }
}

/**
 * 应用 Context 到翻译
 * @param text 原文
 * @param key 当前 key（用于 pattern 匹配）
 * @param context 当前语境标识
 * @param contextMap 词汇表
 * @returns 处理后的文本
 */
export function applyContext(
  text: string,
  key: string,
  context: string | undefined,
  contextMap: ContextMap
): string {
  let result = text;

  // 1. 应用精确匹配
  if (contextMap.exact[text]) {
    const translations = contextMap.exact[text];
    
    if (context && translations[context]) {
      // 如果有特定语境的翻译，使用它
      return translations[context];
    }
    
    if (translations.default) {
      // 否则使用默认翻译
      result = translations.default;
    }
  }

  // 2. 应用正则匹配（pattern）
  for (const pattern in contextMap.pattern) {
    const regex = new RegExp(pattern);
    
    // 检查 key 是否匹配 pattern
    if (regex.test(key)) {
      const contextHint = contextMap.pattern[pattern];
      // 在翻译时会附加这个 hint
      result = `[${contextHint}] ${result}`;
    }
  }

  return result;
}

/**
 * 获取 key 的语境描述
 * 用于给 AI 翻译提供上下文
 */
export function getKeyContext(
  key: string,
  contextMap: ContextMap
): string | undefined {
  // 检查是否有 pattern 匹配
  for (const pattern in contextMap.pattern) {
    const regex = new RegExp(pattern);
    if (regex.test(key)) {
      return contextMap.pattern[pattern];
    }
  }
  return undefined;
}

/**
 * 从 key 提取语境标识
 * 例如：login_btn → 按钮语境
 */
export function extractContextFromKey(key: string): string | undefined {
  if (key.endsWith('_btn') || key.endsWith('_button')) {
    return '按钮文本，简洁明了';
  }
  if (key.endsWith('_title')) {
    return '标题文本，正式完整';
  }
  if (key.endsWith('_desc') || key.endsWith('_description')) {
    return '描述文本，详细说明';
  }
  if (key.endsWith('_placeholder')) {
    return '占位提示文本';
  }
  if (key.endsWith('_error')) {
    return '错误提示文本';
  }
  if (key.endsWith('_success')) {
    return '成功提示文本';
  }
  return undefined;
}
