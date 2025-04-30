import { NoBreak, Box, Code, VStack, createIcon } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/NoBreak',
  decorators: [Provider],
};

const CheckIcon = createIcon({
  displayName: 'CheckIcon',
  viewBox: '0 0 14 14',
  path: (
    <g fill="currentColor">
      <polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039" />
    </g>
  ),
});

export function All() {
  return (
    <VStack>
      <Box w="320px" bg="green.400" fontSize="sm">
        With <Code>NoBreak</Code>.<br />
        This is too long to keep the icon on the same line
        <NoBreak>
          <CheckIcon size="sm" ml="2" />
        </NoBreak>
      </Box>

      <Box w="320px" bg="red.400" fontSize="sm">
        Without <Code>NoBreak</Code>.<br />
        This is too long to keep the icon on the same line
        <CheckIcon size="sm" ml="2" />
      </Box>
    </VStack>
  );
}

All.storyName = 'NoBreak';
