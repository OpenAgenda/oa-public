import ModularSet from 'components/strapi/ModularSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/Modular',
  decorators: [ProvidersDecorator],
};

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
            maxWidth: { name: 'full' },
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
            maxWidth: { name: 'full' },
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
        alignHeight
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
export function Carousel() {
  return (
    <ModularSet
      title="Carousel"
      useCarousel={true}
      Components={[
        {
          id: 1,
          ...fx.default,
          description: 'First item in the carousel.',
          card: true,
          maxWidth: { name: 'full' },
          width: { name: 'full' },
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
          CTA: {
            label: 'Une action',
            link: 'mailto:support@openagenda.com',
            variant: 'link',
          },
        },
        {
          id: 2,
          ...fx.default,
          description: 'Second item in the carousel.',
          card: true,
          maxWidth: { name: 'full' },
          width: { name: 'full' },
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
          CTA: {
            label: 'Une action',
            link: 'mailto:support@openagenda.com',
            variant: 'link',
          },
        },
        {
          id: 3,
          ...fx.default,
          description: 'Third item in the carousel.',
          card: true,
          maxWidth: { name: 'full' },
          width: { name: 'full' },
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
          CTA: {
            label: 'Une action',
            link: 'mailto:support@openagenda.com',
            variant: 'link',
          },
        },
        {
          id: 4,
          ...fx.default,
          description: 'Fourth item in the carousel.',
          card: true,
          maxWidth: { name: 'full' },
          width: { name: 'full' },
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
          CTA: {
            label: 'Une action',
            link: 'mailto:support@openagenda.com',
            variant: 'link',
          },
        },
      ]}
    />
  );
}
