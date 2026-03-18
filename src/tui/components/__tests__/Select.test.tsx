/**
 * Select 组件测试
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { Select } from '../Select.js';
import { describe, it, expect, vi } from 'vitest';

const TEST_OPTIONS = [
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
  { label: '选项3', value: 'option3' },
];

describe('Select', () => {
  it('应该渲染标签和选项列表', () => {
    const onSelect = vi.fn();
    const { lastFrame } = render(
      <Select label="选择语言" options={TEST_OPTIONS} onSelect={onSelect} />
    );

    expect(lastFrame()).toContain('选择语言');
    expect(lastFrame()).toContain('选项1');
    expect(lastFrame()).toContain('选项2');
    expect(lastFrame()).toContain('选项3');
  });

  it('应该高亮第一个选项', () => {
    const onSelect = vi.fn();
    const { lastFrame } = render(
      <Select label="选择" options={TEST_OPTIONS} onSelect={onSelect} />
    );

    // 第一个选项应该有选中标记
    expect(lastFrame()).toContain('▶');
  });
});
