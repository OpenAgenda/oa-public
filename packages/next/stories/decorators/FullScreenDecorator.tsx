import { Box } from '@openagenda/uikit';

const FullScreenDecorator = (Story) => (
  <Box bg="white">
    <Story />
  </Box>
);

export default FullScreenDecorator;
