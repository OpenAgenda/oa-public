import { Flex, Box, Text } from '@openagenda/uikit';
import StrapiIllustration from 'components/strapi/Illustration';
import Icon from 'components/strapi/Icon';
import AccordionSet from 'components/strapi/AccordionSet';
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
        <Text align="center">
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
        <Text align="center">
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
        <Text align="center">
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

export function Accordion() {
  return (
    <AccordionSet
      title="Accordion"
      useAccordion={true}
      Components={[
        {
          id: 1,
          title: 'Section 1',
          description: 'Content for section 1',
          CTA: {
            label: 'Learn more',
            link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
          },
          Icon: {
            name: 'chart-network',
            size: '2x',
            style: 'thin',
          },
        },
        {
          id: 2,
          title: 'Section 2',
          description: 'Content for section 2',
          CTA: {
            label: 'Learn more',
            link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
          },
          Icon: {
            name: 'calendar',
            size: '2x',
            style: 'thin',
          },
        },
        {
          id: 3,
          title: 'Section 3',
          description: 'Content for section 3',
          CTA: {
            label: 'Learn more',
            link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
          },
          Icon: {
            name: 'code',
            size: '2x',
            style: 'thin',
          },
        },
      ]}
    />
  );
}
