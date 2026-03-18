/**
 * Header 组件 - 顶部 Logo 和标题
 */

import React from 'react';
import { Box, Text } from 'ink';

export function Header(): React.JSX.Element {
  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={2} paddingY={1} justifyContent="center">
      <Text bold color="cyan">🐵 大圣 Dasheng</Text>
      <Text>  </Text>
      <Text color="gray">|</Text>
      <Text>  </Text>
      <Text color="yellow">通背猿猴 v2.0</Text>
      <Text>  </Text>
      <Text color="gray">|</Text>
      <Text>  </Text>
      <Text color="white">72变无所不能</Text>
    </Box>
  );
}
