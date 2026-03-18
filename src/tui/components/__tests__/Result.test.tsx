/**
 * Result 组件测试
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { Result } from '../Result.js';
import { describe, it, expect } from 'vitest';

describe('Result', () => {
  it('应该渲染成功消息', () => {
    const { lastFrame } = render(
      <Result success={true} message="操作成功" />
    );

    expect(lastFrame()).toContain('✅');
    expect(lastFrame()).toContain('操作成功');
  });

  it('应该渲染失败消息', () => {
    const { lastFrame } = render(
      <Result success={false} message="操作失败" />
    );

    expect(lastFrame()).toContain('❌');
    expect(lastFrame()).toContain('操作失败');
  });

  it('应该渲染详情列表', () => {
    const { lastFrame } = render(
      <Result 
        success={true} 
        message="完成" 
        details={['详情1', '详情2', '详情3']}
      />
    );

    expect(lastFrame()).toContain('详情1');
    expect(lastFrame()).toContain('详情2');
    expect(lastFrame()).toContain('详情3');
  });
});
