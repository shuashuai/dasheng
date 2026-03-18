/**
 * Spinner 组件测试
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { Spinner } from '../Spinner.js';
import { describe, it, expect } from 'vitest';

describe('Spinner', () => {
  it('应该渲染加载文本', () => {
    const { lastFrame } = render(<Spinner text="加载中..." />);

    expect(lastFrame()).toContain('加载中...');
  });
});
