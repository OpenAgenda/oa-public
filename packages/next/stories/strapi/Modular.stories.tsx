import { Grid, GridItem } from '@openagenda/uikit';
import Modular from 'components/strapi/Modular';
import ModularSet from 'components/strapi/ModularSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/Modular',
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <Grid display="flex" flexWrap="wrap" gap={8} p={8} alignItems="stretch">
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
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
          }}
          title="Phteven"
          description="Également connu sous le nom de **Tuna**, Phteven est un chien devenu célèbre sur Internet en raison de son apparence distinctive et de son sourire particulier. Sa popularité a inspiré la création de mèmes humoristiques, souvent utilisés pour exprimer des situations comiques ou des jeux de mots. Par exemple, des générateurs de mèmes en ligne permettent aux utilisateurs de créer leurs propres versions en utilisant l'image de Ptheven."
          CTA={{
            label: 'Voir plus',
            link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
          }}
        />
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
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
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
        <Modular
          title="Un icône"
          description="L'icône vient de Font Awesome."
          Icon={{
            name: 'chart-network',
            size: '3x',
            style: 'thin',
          }}
        />
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
        <Modular
          {...fx.default}
          card
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
            variant: 'outline',
          }}
        />
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
        <Modular
          title="Un icône et une image"
          description="Description centrée"
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
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
        <Modular
          title="Une liste à puces"
          CTA={null}
          description={`Créée en 2015, OpenAgenda recense aujourd’hui :
- **1 480 886 événements**
- **40 897 agendas**
- **553 554 contributeurs et contributrices**`}
          card
          Icon={{
            name: 'chart-network',
            size: '3x',
            style: 'thin',
          }}
          contentAlign="center"
        />
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
        <Modular
          card
          title="Phteven"
          Icon={{
            name: 'chart-network',
            size: '1x',
            style: 'normal',
          }}
          Tag="Un tag"
          tagColor={{
            name: 'primary',
            swatch: '500',
          }}
          contentAlign="left"
          description="Également connu sous le nom de **Tuna**, Phteven est un chien devenu célèbre sur Internet en raison de son apparence distinctive et de son sourire particulier. Sa popularité a inspiré la création de mèmes humoristiques, souvent utilisés pour exprimer des situations comiques ou des jeux de mots. Par exemple, des générateurs de mèmes en ligne permettent aux utilisateurs de créer leurs propres versions en utilisant l'image de Ptheven."
          CTA={{
            label: 'Voir plus',
            link: 'https://duckduckgo.com/?t=ffab&q=phteven&iax=images&ia=images',
          }}
        />
      </GridItem>
      <GridItem w="full" justifyItems="center" flex="1 1 33.333%">
        <Modular
          card
          title="Une description avec un lien"
          description="[Ceci est un lien ](https://openagenda.com)"
        />
      </GridItem>
    </Grid>
  );
}

export function Widths() {
  return (
    <>
      <ModularSet
        title="Bigger to the left"
        Components={[
          {
            id: 1,
            ...fx.default,
            grow: 2,
            description:
              "Au bord d'un lac scintillant, entouré de roseaux et de nénuphars, vivait un flamant rose nommé Félix. Félix était un flamant un peu spécial : il adorait admirer son reflet dans l'eau. Tous les matins, dès l'aube, il s'approchait du lac, ajustait ses plumes soigneusement et se contemplait, fier de son plumage éclatant.",
            card: true,
          },
          {
            id: 2,
            ...fx.default,
          },
        ]}
      />
      <ModularSet
        title="Width adapted to content"
        Components={[
          {
            id: 1,
            ...fx.default,
            description:
              "Au bord d'un lac scintillant, entouré de roseaux et de nénuphars, vivait un flamant rose nommé Félix. Félix était un flamant un peu spécial : il adorait admirer son reflet dans l'eau. Tous les matins, dès l'aube, il s'approchait du lac, ajustait ses plumes soigneusement et se contemplait, fier de son plumage éclatant.",
            card: true,
          },
          {
            id: 2,
            ...fx.default,
          },
        ]}
      />
      <ModularSet
        title="Same widths"
        Components={[
          {
            id: 1,
            ...fx.default,
            description:
              "Au bord d'un lac scintillant, entouré de roseaux et de nénuphars, vivait un flamant rose nommé Félix. Félix était un flamant un peu spécial : il adorait admirer son reflet dans l'eau. Tous les matins, dès l'aube, il s'approchait du lac, ajustait ses plumes soigneusement et se contemplait, fier de son plumage éclatant.",
            card: true,
          },
          {
            id: 2,
            ...fx.default,
          },
        ]}
      />
    </>
  );
}

export function Heights() {
  return (
    <>
      <ModularSet
        title="Aligned"
        verticalAlign="stretch"
        Components={[
          {
            id: 1,
            ...fx.default,
            description: 'Short description to show height difference.',
            card: true,
          },
          {
            id: 2,
            ...fx.default,
            description:
              'A longer description that would normally make this card taller. This demonstrates how alignHeight makes all cards the same height regardless of content length. The description text should adapt to fill the available space.',
            card: true,
          },
        ]}
      />
      <ModularSet
        title="Default"
        Components={[
          {
            id: 3,
            ...fx.default,
            description: 'Short description to show height difference.',
            card: true,
          },
          {
            id: 4,
            ...fx.default,
            description: `A longer description that would normally make this card taller.

This demonstrates how alignHeight makes all cards the same height regardless of content length.
The description text should adapt to fill the available space.`,
            card: true,
          },
        ]}
      />
    </>
  );
}

export function Colors() {
  return (
    <ModularSet
      title="Colors"
      verticalAlign="stretch"
      Components={[
        {
          id: 1,
          ...fx.default,
          title: 'The modular title is black',
          description: 'The modular description is grey',
          titleColor: { name: 'black' },
          descriptionColor: { name: 'grey' },
          card: true,
        },
        {
          id: 2,
          ...fx.default,
          title: 'The modular title is black',
          description: 'The modular description is also black',
          titleColor: { name: 'black' },
          descriptionColor: { name: 'black' },
          card: true,
        },
      ]}
    />
  );
}
