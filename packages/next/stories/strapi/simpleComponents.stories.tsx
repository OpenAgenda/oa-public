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
          maxWidth="lg"
        />
        <Text align="center">
          <code>{`maxWidth="lg"`}</code>
        </Text>
      </Box>
      <Box m={3}>
        <StrapiIllustration
          image={{
            url: '/squarePhteven.jpg',
          }}
          maxWidth="sm"
          borderRadius="full"
        />
        <Text align="center">
          <code>{`maxWidth="sm" borderRadius="full"`}</code>
        </Text>
      </Box>
      <Box m={3}>
        <StrapiIllustration
          image={{
            url: '/squarePhteven.jpg',
          }}
          maxWidth="3xs"
          borderRadius="full"
        />
        <Text align="center">
          <code>{`maxWidth="2xs"`}</code>
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
        <Icon type="solid" name="clipboard" size="2xl" />
      </Box>
      <Box m={3}>
        <Icon type="regular" name="rocket-launch" size="2x" />
      </Box>
      <Box m={3}>
        <Icon type="thin" name="chart-network" size="4x" />
      </Box>
    </Flex>
  );
}
