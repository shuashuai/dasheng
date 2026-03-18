/**
 * TextInput 组件测试
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { TextInput } from '../TextInput.js';
import { describe, it, expect, vi } from 'vitest';

describe('TextInput', () => {
  it('应该渲染标签和输入框', () => {
    const onSubmit = vi.fn();
    const { lastFrame } = render(
      <TextInput label="测试标签" placeholder="测试占位符" onSubmit={onSubmit} />
    );

    expect(lastFrame()).toContain('测试标签');
    expect(lastFrame()).toContain('测试占位符');
  });

  it('应该显示默认值', () => {
    const onSubmit = vi.fn();
    const { lastFrame } = render(
      <TextInput label="测试" defaultValue="默认值" onSubmit={onSubmit} />
    );

    expect(lastFrame()).toContain('默认值');
  });
});
