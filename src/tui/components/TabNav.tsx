/**
 * TabNav 组件 - Tab 导航栏
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { TabId } from '../app.js';

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabNav({ tabs, activeTab, onChange }: TabNavProps): React.JSX.Element {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  useInput((_input, key) => {
    if (key.leftArrow) {
      const newIndex = activeIndex > 0 ? activeIndex - 1 : tabs.length - 1;
      onChange(tabs[newIndex].id);
    } else if (key.rightArrow) {
      const newIndex = activeIndex < tabs.length - 1 ? activeIndex + 1 : 0;
      onChange(tabs[newIndex].id);
    }
  });

  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="center">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <Box key={tab.id} marginRight={index < tabs.length - 1 ? 2 : 0}>
            <Text backgroundColor={isActive ? 'cyan' : undefined} color={isActive ? 'black' : 'white'} bold={isActive}>
              {isActive ? ' ' : ''}{tab.emoji} {tab.label}{isActive ? ' ' : ''}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
