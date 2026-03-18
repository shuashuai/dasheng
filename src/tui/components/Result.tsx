/**
 * Result 组件 - 结果显示
 */

import React from 'react';
import { Box, Text } from 'ink';

interface ResultProps {
  success: boolean;
  message: string;
  details?: string[];
}

export function Result({ success, message, details }: ResultProps): React.JSX.Element {
  return (
    <Box flexDirection="column" borderStyle={success ? 'round' : 'single'} borderColor={success ? 'green' : 'red'} padding={1}>
      <Text bold color={success ? 'green' : 'red'}>
        {success ? '✅ ' : '❌ '}{message}
      </Text>
      {details && details.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {details.map((detail, index) => (
            <Text key={index} color="gray">{detail}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
