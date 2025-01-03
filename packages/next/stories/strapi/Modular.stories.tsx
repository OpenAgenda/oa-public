import { Flex, Box } from '@openagenda/uikit';
import Modular from 'components/strapi/Modular';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/Modular',
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <Flex justify="center" align="center" height="100vh">
      <Box m={4}>
        <Modular {...fx.default} />
      </Box>
      <Box m={4}>
        <Modular
          {...fx.default}
          card
          description={`${fx.default.description}. Avec la prop "card"`}
        />
      </Box>
      <Box m={4}>
        <Modular
          {...fx.default}
          Illustration={{
            image: {
              url: '/rectanglePhteven.jpg',
            },
          }}
          description={`${fx.default.description}. Avec une image pas arrondie par la prop "borderRadius" ni "maxWidth"`}
        />
      </Box>
      <Box m={4}>
        <Modular {...fx.default} title="Pas de bouton" CTA={null} card />
      </Box>
      <Box m={4}>
        <Modular
          {...fx.default}
          title="Une petite image pas étirée"
          Illustration={{
            image: {
              url: '/tinyPhteven.jpg',
            },
            borderRadius: 'full',
          }}
        />
      </Box>
    </Flex>
  );
}
