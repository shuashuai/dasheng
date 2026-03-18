/**
 * Footer 组件 - 底部快捷键提示
 */

import React from 'react';
import { Box, Text } from 'ink';

export function Footer(): React.JSX.Element {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} paddingY={0} justifyContent="space-between">
      <Box>
        <Text color="gray">[</Text>
        <Text color="cyan">Tab</Text>
        <Text color="gray">/</Text>
        <Text color="cyan">←→</Text>
        <Text color="gray">] 切换 </Text>
        <Text color="gray">[</Text>
        <Text color="cyan">Enter</Text>
        <Text color="gray">] 确认 </Text>
        <Text color="gray">[</Text>
        <Text color="cyan">q</Text>
        <Text color="gray">/</Text>
        <Text color="cyan">Ctrl+C</Text>
        <Text color="gray">] 退出</Text>
      </Box>
      <Box>
        <Text color="gray">Powered by </Text>
        <Text color="cyan">Ink</Text>
        <Text color="gray"> + </Text>
        <Text color="cyan">React</Text>
      </Box>
    </Box>
  );
}
