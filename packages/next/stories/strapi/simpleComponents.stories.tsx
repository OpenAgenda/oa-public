import { Flex, Box } from '@openagenda/uikit';
import Icon from 'components/strapi/Icon';
import CTAButton from 'components/strapi/CTAButton';
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

export function CTAButtons() {
  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      direction="column"
      gap={4}
    >
      <CTAButton
        link="/example"
        label="Primary Button"
        colorPalette={{ name: 'blueViolet' }}
      />
      <CTAButton
        link="/example"
        label="Secondary Button"
        colorPalette={{ name: 'blueViolet' }}
        variant="outline"
      />
      <Box
        m={3}
        backgroundColor="strapi.blueViolet.500"
        p={16}
        className="dark"
      >
        <CTAButton
          link="/example"
          label="Tertiary Button"
          colorPalette={{ name: 'rosyRed' }}
          variant="solid"
        />
      </Box>
      <Box
        m={3}
        backgroundColor="strapi.blueViolet.500"
        p={16}
        className="dark"
      >
        <CTAButton
          link="/example"
          label="Tertiary Button"
          variant="outline"
          colorPalette={{ name: 'rosyRed' }}
        />
      </Box>
    </Flex>
  );
}
