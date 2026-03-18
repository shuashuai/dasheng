/**
 * TextInput 组件 - 文本输入
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface TextInputProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
}

export function TextInput({ label, placeholder = '', defaultValue = '', onSubmit }: TextInputProps): React.JSX.Element {
  const [value, setValue] = useState(defaultValue);
  const [isFocused] = useState(true);

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return) {
      onSubmit(value);
    } else if (key.backspace || key.delete) {
      setValue(value.slice(0, -1));
    } else if (!key.ctrl && !key.meta && input) {
      setValue(value + input);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">{label}</Text>
      <Box borderStyle="single" borderColor={isFocused ? 'cyan' : 'gray'} paddingX={1}>
        <Text color={value ? 'white' : 'gray'}>
          {value || placeholder}
        </Text>
        {isFocused && <Text color="cyan">_</Text>}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">按 Enter 确认</Text>
      </Box>
    </Box>
  );
}
