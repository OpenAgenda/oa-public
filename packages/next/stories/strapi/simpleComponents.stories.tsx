import { Flex, Box, SimpleGrid, Text } from '@openagenda/uikit';
import Icon from 'components/strapi/Icon';
import { color } from 'utils/strapi';
import CTAButton from 'components/strapi/CTAButton';
import MultiColorText from 'components/strapi/MultiColorText';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Components',
  decorators: [ProvidersDecorator],
};

const ColorItem = ({ code }) => (
  <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
    <Box
      backgroundColor={color(code, 500)}
      width="100px"
      height="100px"
      mb={1}
    />
    <Text>{code}</Text>
  </Box>
);

export function Colors() {
  return (
    <SimpleGrid
      backgroundColor="white"
      minChildWidth="120px"
      gap="10px"
      p={4}
      width="100%"
    >
      {[
        'frenchBlue',
        'celestialBlue',
        'moonStone',
        'turquoise',
        'lightGreen',
        'icterine',
        'royalBlue',
        'amethyst',
        'pompAndPower',
        'pompAndPowerer',
        'mulberry',
        'spotVistaBlue',
        'spotAliceBlue',
        'goldenRod',
        'papayaWhip',
        'coyote',
        'charcoal',
        'cadetGray',
        'fuchsiaRose',
        'tickleMePink',
        'myrtleGreen',
        'chiliRed',
        'seaGreen',
        'vistaBlue',
        'discreetAliceBlue',
        'vanilla',
        'pictonBlue',
        'azure',
        'lightSkyBlue',
        'marianBlue',
        'mayaBlue',
        'bleuDeFrance',
        'mediumSlateBlue',
        'razzmatazz',
        'carribeanCurrent',
        'persianGreen',
        'ashGray',
        'burntOrange',
        'darkCyan',
        'aquamarine',
        'mint',
        'skipSeaGreen',
        'naturalAliceBlue',
        'ruddyBlue',
        'sepia',
        'goldenBrown',
        'satinSheetGold',
      ].map((code) => (
        <ColorItem key={code} code={code} />
      ))}
    </SimpleGrid>
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

export function CTAButtons() {
  const link = 'https://mycolor.space/?hex=%231D77CE&sub=1';
  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      direction="column"
      gap={4}
    >
      <CTAButton
        link={link}
        label="Royal blue"
        color={{ name: 'royalBlue' }}
        size="sm"
      />
      <CTAButton
        link={link}
        label="French blue"
        color={{ name: 'frenchBlue' }}
        size="md"
      />
      <CTAButton
        link={link}
        label="Natural alice blue"
        color={{ name: 'naturalAliceBlue' }}
        size="lg"
      />
      <CTAButton
        link={link}
        label="Golden brown"
        color={{ name: 'goldenBrown' }}
        size="xl"
      />
      <CTAButton
        link={link}
        label="Razzmatazz"
        color={{ name: 'razzmatazz' }}
        size="xs"
      />
    </Flex>
  );
}

export function MultiColorTextDefault() {
  // Define color object once to avoid duplication
  const bleuDeFranceColor = {
    id: 48,
    documentId: 'tgwzvvlixyl1sliulhr8cako',
    name: 'bleuDeFrance',
    createdAt: '2025-09-05T08:56:34.081Z',
    updatedAt: '2025-09-05T08:56:34.081Z',
    publishedAt: '2025-09-05T08:56:34.088Z',
  };

  return (
    <MultiColorText
      as="h1"
      TextParts={[
        {
          id: 1,
          text: 'Publiez un ',
          color: null,
        },
        {
          id: 2,
          text: 'agenda',
          color: bleuDeFranceColor,
        },
        {
          id: 3,
          text: ', rassemblez et diffusez toutes vos annonces ',
          color: null,
        },
        {
          id: 4,
          text: "d'événements",
          color: bleuDeFranceColor,
        },
      ]}
    />
  );
}
