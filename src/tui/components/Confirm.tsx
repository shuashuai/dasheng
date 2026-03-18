/**
 * Confirm 组件 - 确认选择 (Yes/No)
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface ConfirmProps {
  label: string;
  defaultValue?: boolean;
  onConfirm: (value: boolean) => void;
}

export function Confirm({ label, defaultValue = false, onConfirm }: ConfirmProps): React.JSX.Element {
  const [value, setValue] = useState(defaultValue);

  useInput((input, key) => {
    if (key.leftArrow || key.rightArrow) {
      setValue(prev => !prev);
    } else if (input === 'y' || input === 'Y') {
      setValue(true);
    } else if (input === 'n' || input === 'N') {
      setValue(false);
    } else if (key.return) {
      onConfirm(value);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">{label}</Text>
      <Box marginTop={1}>
        <Text color={value ? 'cyan' : 'white'} bold={value} backgroundColor={value ? 'cyan' : undefined}>
          {' '}Yes{' '}
        </Text>
        <Text>  </Text>
        <Text color={!value ? 'cyan' : 'white'} bold={!value} backgroundColor={!value ? 'cyan' : undefined}>
          {' '}No{' '}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">←→ 选择，Enter 确认</Text>
      </Box>
    </Box>
  );
}
