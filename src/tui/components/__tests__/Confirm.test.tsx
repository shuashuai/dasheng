/**
 * Confirm 组件测试
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { Confirm } from '../Confirm.js';
import { describe, it, expect, vi } from 'vitest';

describe('Confirm', () => {
  it('应该渲染标签和 Yes/No 选项', () => {
    const onConfirm = vi.fn();
    const { lastFrame } = render(
      <Confirm label="确认删除?" onConfirm={onConfirm} />
    );

    expect(lastFrame()).toContain('确认删除?');
    expect(lastFrame()).toContain('Yes');
    expect(lastFrame()).toContain('No');
  });

  it('默认应该选中 No', () => {
    const onConfirm = vi.fn();
    const { lastFrame } = render(
      <Confirm label="确认?" onConfirm={onConfirm} />
    );

    expect(lastFrame()).toContain('No');
  });

  it('应该支持默认值为 Yes', () => {
    const onConfirm = vi.fn();
    const { lastFrame } = render(
      <Confirm label="确认?" defaultValue={true} onConfirm={onConfirm} />
    );

    expect(lastFrame()).toContain('Yes');
  });
});
