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
        <Modular
          {...fx.default}
          card
          backgroundColor={{
            name: 'teal',
            swatch: '50',
          }}
          Illustration={{
            image: {
              url: '/squarePhteven.jpg',
            },
            borderRadius: 'full',
            width: { name: '2xl' },
          }}
          maxWidth={{ name: 'md' }}
          title="Phteven"
          description="Également connu sous le nom de **Tuna**, Phteven est un chien devenu célèbre sur Internet en raison de son apparence distinctive et de son sourire particulier. Sa popularité a inspiré la création de mèmes humoristiques, souvent utilisés pour exprimer des situations comiques ou des jeux de mots. Par exemple, des générateurs de mèmes en ligne permettent aux utilisateurs de créer leurs propres versions en utilisant l'image de Ptheven."
          CTA={{
            label: 'Voir plus',
            link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
          }}
        />
      </WrapItem>
      <WrapItem>
        <Modular
          {...fx.default}
          title="Petit Phteven"
          CTA={null}
          card
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
            style: 'thin',
          }}
        />
      </WrapItem>
      <WrapItem>
        <Modular
          {...fx.default}
          card
          maxWidth={{ name: 'xs' }}
          Illustration={{
            image: {
              url: '/rectanglePhteven.jpg',
            },
          }}
          description={`${fx.default.description}. Avec la prop "card"`}
          CTA={{
            label: 'Une action',
            link: 'mailto:support@openagenda.com',
            backgroundColor: {
              name: 'teal',
              swatch: '500',
            },
            fontColor: {
              name: 'white',
            },
          }}
        />
      </WrapItem>
      <WrapItem>
        <Modular
          title="Un icône et une image"
          description="Description centrée"
          maxWidth={{ name: 'lg' }}
          Illustration={{
            image: {
              url: '/rectanglePhteven.jpg',
            },
            borderRadius: null,
          }}
          Icon={{
            name: 'chart-network',
            size: '3x',
            style: 'thin',
          }}
          card
        />
      </WrapItem>
    </Wrap>
  );
}
