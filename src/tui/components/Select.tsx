/**
 * Select 组件 - 单选列表
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
}

export function Select({ label, options, onSelect }: SelectProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onSelect(options[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">{label}</Text>
      <Box flexDirection="column" marginTop={1}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={option.value}>
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {isSelected ? '▶ ' : '  '}{option.label}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">↑↓ 选择，Enter 确认</Text>
      </Box>
    </Box>
  );
}
