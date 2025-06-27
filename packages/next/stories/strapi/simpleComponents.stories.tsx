import { Flex, Box } from '@openagenda/uikit';
import Icon from 'components/strapi/Icon';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Components',
  decorators: [ProvidersDecorator],
};

export function Icons() {
  return (
    <Flex justify="center" align="center" height="100vh">
      <Box m={3}>
        <Icon style="solid" name="clipboard" size="fa-1x" />
      </Box>
      <Box m={3}>
        <Icon style="regular" name="rocket-launch" size="fa-2x" />
      </Box>
      <Box m={3}>
        <Icon style="thin" name="chart-network" size="fa-4x" />
      </Box>
      <Box m={3}>
        <Icon style="solid" name="magnifying-glass" size="fa-lg" />
      </Box>
    </Flex>
  );
}
