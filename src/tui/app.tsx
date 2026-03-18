#!/usr/bin/env node

/**
 * 🐵 大圣 TUI 入口 - 通背猿猴
 * 
 * Ink + React 构建的终端用户界面
 * 提供可视化的交互体验
 */

import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';

// Tab 定义
export type TabId = 'dashboard' | 'translate-yaml' | 'translate-md' | 'generate-cover' | 'generate-blog';

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: '首页', emoji: '🏠' },
  { id: 'translate-yaml', label: '语言通', emoji: '🌐' },
  { id: 'translate-md', label: '译真经', emoji: '📝' },
  { id: 'generate-cover', label: '画皮术', emoji: '🎨' },
  { id: 'generate-blog', label: '妙笔生花', emoji: '✍️' },
];

// 简单屏幕组件
function DashboardScreen({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const quickActions = [
    { label: '语言通', emoji: '🌐', tab: 'translate-yaml' as TabId, desc: 'YAML 多语言翻译' },
    { label: '译真经', emoji: '📝', tab: 'translate-md' as TabId, desc: 'Markdown 翻译' },
    { label: '画皮术', emoji: '🎨', tab: 'generate-cover' as TabId, desc: '生成封面图' },
    { label: '妙笔生花', emoji: '✍️', tab: 'generate-blog' as TabId, desc: '生成技术博客' },
  ];

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : quickActions.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < quickActions.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onTabChange(quickActions[selectedIndex].tab);
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Box borderStyle="round" borderColor="yellow" padding={1}>
        <Text>欢迎来到 <Text bold color="cyan">大圣 Dasheng</Text>！ <Text color="gray">72变无所不能，一棒扫清万难</Text></Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold color="white">⚡ 快速入口</Text>
        <Text color="gray">使用 ↑↓ 选择，Enter 进入</Text>
        
        <Box flexDirection="column" marginTop={1}>
          {quickActions.map((action, index) => {
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

      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text color="gray">💡 提示：</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text color="gray">• ← → 或 Tab 切换上方功能 Tab</Text>
          <Text color="gray">• 每个功能都有交互式向导</Text>
          <Text color="gray">• 按 q 或 Ctrl+C 随时退出</Text>
        </Box>
      </Box>

      <Box marginTop={1} justifyContent="center">
        <Text color="gray">大圣 Dasheng v2.0 - 通背猿猴</Text>
      </Box>
    </Box>
  );
}

// 导入功能屏幕
import { TranslateYamlScreen } from './screens/TranslateYamlScreen.js';
import { TranslateMdScreen } from './screens/TranslateMdScreen.js';
import { GenerateCoverScreen } from './screens/GenerateCoverScreen.js';
import { GenerateBlogScreen } from './screens/GenerateBlogScreen.js';

export default function App() {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const activeIndex = TABS.findIndex(tab => tab.id === activeTab);

  // 键盘导航
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
      return;
    }
    
    if (key.leftArrow) {
      const newIndex = activeIndex > 0 ? activeIndex - 1 : TABS.length - 1;
      setActiveTab(TABS[newIndex].id);
    } else if (key.rightArrow) {
      const newIndex = activeIndex < TABS.length - 1 ? activeIndex + 1 : 0;
      setActiveTab(TABS[newIndex].id);
    }
  });

  // 渲染当前 Tab 内容
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onTabChange={setActiveTab} />;
      case 'translate-yaml':
        return <TranslateYamlScreen />;
      case 'translate-md':
        return <TranslateMdScreen />;
      case 'generate-cover':
        return <GenerateCoverScreen />;
      case 'generate-blog':
        return <GenerateBlogScreen />;
      default:
        return <DashboardScreen onTabChange={setActiveTab} />;
    }
  };

  return (
    <Box flexDirection="column">
      <Header />
      
      {/* Tab 导航 */}
      <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="center">
        {TABS.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <Box key={tab.id} marginRight={index < TABS.length - 1 ? 2 : 0}>
              <Text backgroundColor={isActive ? 'cyan' : undefined} color={isActive ? 'black' : 'white'} bold={isActive}>
                {isActive ? ' ' : ''}{tab.emoji} {tab.label}{isActive ? ' ' : ''}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* 主内容区 */}
      <Box flexDirection="column" padding={1} minHeight={10}>
        {renderContent()}
      </Box>

      <Footer />
    </Box>
  );
}
