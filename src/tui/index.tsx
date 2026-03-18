#!/usr/bin/env node

/**
 * TUI 入口文件
 * 
 * 用法:
 *   dasheng tui
 *   dasheng ui
 */

import React from 'react';
import { render } from 'ink';
import App from './app.js';

export async function startTUI() {
  const { waitUntilExit } = render(<App />);
  await waitUntilExit();
}
