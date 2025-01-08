import { Flex, Box, Text } from '@openagenda/uikit';
import StrapiIllustration from 'components/strapi/Illustration';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Components',
  decorators: [ProvidersDecorator],
};

export function Illustration() {
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
