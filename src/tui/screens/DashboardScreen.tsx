/**
 * DashboardScreen - 首页仪表盘
 * 展示欢迎信息、快捷入口、使用统计
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { TabId } from '../app.js';

interface DashboardScreenProps {
  onTabChange?: (tab: TabId) => void;
}

const QUICK_ACTIONS: { label: string; emoji: string; tab: TabId; desc: string }[] = [
  { label: '语言通', emoji: '🌐', tab: 'translate-yaml', desc: 'YAML 多语言翻译' },
  { label: '译真经', emoji: '📝', tab: 'translate-md', desc: 'Markdown 翻译' },
  { label: '画皮术', emoji: '🎨', tab: 'generate-cover', desc: '生成封面图' },
  { label: '妙笔生花', emoji: '✍️', tab: 'generate-blog', desc: '生成技术博客' },
];

export function DashboardScreen({ onTabChange }: DashboardScreenProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useInput((_input, key) => {
    if (!onTabChange) return;

    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : QUICK_ACTIONS.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < QUICK_ACTIONS.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onTabChange(QUICK_ACTIONS[selectedIndex].tab);
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      {/* 欢迎语 */}
      <Box borderStyle="round" borderColor="yellow" padding={1}>
        <Text>
          欢迎来到 <Text bold color="cyan">大圣 Dasheng</Text>！
        </Text>
        <Text> </Text>
        <Text color="gray">
          72变无所不能，一棒扫清万难
        </Text>
      </Box>

      {/* 快速入口 */}
      <Box flexDirection="column" marginTop={1}>
        <Text bold color="white">⚡ 快速入口</Text>
        <Text color="gray">使用 ↑↓ 选择，Enter 进入，或按 Tab 切换到上方导航</Text>
        
        <Box flexDirection="column" marginTop={1}>
          {QUICK_ACTIONS.map((action, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Box key={action.tab}>
                <Text 
                  color={isSelected ? 'cyan' : 'white'} 
                  bold={isSelected}
                  backgroundColor={isSelected ? 'cyan' : undefined}
                >
                  {isSelected ? '▶ ' : '  '}
                  {action.emoji} {action.label}
                  {!isSelected && <Text color="gray"> - {action.desc}</Text>}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 使用提示 */}
      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text color="gray">💡 提示：</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text color="gray">• ← → 或 Tab 切换上方功能 Tab</Text>
          <Text color="gray">• 每个功能都有交互式向导</Text>
          <Text color="gray">• 按 q 或 Ctrl+C 随时退出</Text>
        </Box>
      </Box>

      {/* 版本信息 */}
      <Box marginTop={1} justifyContent="center">
        <Text color="gray">大圣 Dasheng v2.0 - 通背猿猴</Text>
      </Box>
    </Box>
  );
}
