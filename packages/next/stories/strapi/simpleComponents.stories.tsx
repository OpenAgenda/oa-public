import { Flex, Box, Text } from '@openagenda/uikit';
import StrapiIllustration from 'components/strapi/Illustration';
import Icon from 'components/strapi/Icon';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Components',
  decorators: [ProvidersDecorator],
};

export function Illustrations() {
  return (
    <Flex justify="center" align="center" height="100vh">
      <Box m={3}>
        <StrapiIllustration
          image={{
            url: '/rectanglePhteven.jpg',
          }}
          width={{ name: 'lg' }}
        />
        <Text textAlign="center">
          <code>{`width={{ name: 'lg' }}`}</code>
        </Text>
      </Box>
      <Box m={3}>
        <StrapiIllustration
          image={{
            url: '/squarePhteven.jpg',
          }}
          width={{ name: 'sm' }}
          borderRadius="full"
        />
        <Text textAlign="center">
          <code>{`width={{ name: 'sm' }}`}</code>
          <br />
          <code>{`borderRadius="full"`}</code>
        </Text>
      </Box>
      <Box m={3}>
        <StrapiIllustration
          image={{
            url: '/squarePhteven.jpg',
          }}
          width={{ name: '3xs' }}
          borderRadius="full"
        />
        <Text textAlign="center">
          <code>{`width={{ name: '2xs' }}`}</code>
          <br />
          <code>{`borderRadius="full"`}</code>
        </Text>
      </Box>
    </Flex>
  );
}

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
