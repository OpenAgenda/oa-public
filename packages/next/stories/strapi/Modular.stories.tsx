import { Wrap, WrapItem } from '@openagenda/uikit';
import Modular from 'components/strapi/Modular';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/Modular',
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <Wrap p="20px" spacing="20px" align="center">
      <WrapItem>
        <Modular {...fx.default} />
      </WrapItem>
      <WrapItem>
        <Modular
          {...fx.default}
          card
          description={`${fx.default.description}. Avec la prop "card"`}
        />
      </WrapItem>
      <WrapItem>
        <Modular
          {...fx.default}
          Illustration={{
            image: {
              url: '/rectanglePhteven.jpg',
            },
          }}
          description={`${fx.default.description}. Avec une image pas arrondie par la prop "borderRadius" ni "maxWidth"`}
        />
      </WrapItem>
      <WrapItem>
        <Modular {...fx.default} title="Pas de bouton" CTA={null} card />
      </WrapItem>
      <WrapItem>
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
      </WrapItem>
      <WrapItem>
        <Modular
          title="Un icône"
          description="L'icône vient de Font Awesome."
          Icon={{
            name: 'chart-network',
            size: '3x',
            type: 'thin',
          }}
        />
      </WrapItem>
      <WrapItem>
        <Modular
          title="Un icône et une image"
          description="L'un peu complementer l'autre"
          maxWidth="lg"
          Illustration={{
            image: {
              url: '/rectanglePhteven.jpg',
            },
            borderRadius: null,
          }}
          Icon={{
            name: 'chart-network',
            size: '3x',
            type: 'thin',
          }}
          card
        />
      </WrapItem>
    </Wrap>
  );
}
