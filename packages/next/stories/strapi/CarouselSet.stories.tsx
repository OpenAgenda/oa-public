import CarouselSet from 'components/strapi/CarouselSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/CarouselSet',
  decorators: [ProvidersDecorator],
};

export function Carousel() {
  return (
    <CarouselSet
      title="Carousel"
      carouselBgColor={{ name: 'teal', swatch: '500' }}
      Components={[
        {
          id: 1,
          ...fx.default,
          title: 'First item in the carousel.',
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
            colorScheme: { name: 'teal', swatch: '500' },
          },
        },
        {
          id: 2,
          ...fx.default,
          title: 'Second item in the carousel.',
          description:
            'This second item in the carousel contains an extremely long description to test the layout and display. We want to ensure that even a very detailed and extended text remains readable and does not break the component’s design. Through this, we evaluate the limits and flexibility of the carousel in handling large amounts of content.',
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
            colorScheme: { name: 'teal', swatch: '500' },
          },
        },
        {
          id: 3,
          ...fx.default,
          title: 'Third item in the carousel.',
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
            colorScheme: { name: 'teal', swatch: '500' },
          },
        },
        {
          id: 4,
          ...fx.default,
          title: 'Fourth item in the carousel.',
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
            colorScheme: { name: 'teal', swatch: '500' },
          },
        },
      ]}
    />
  );
}

export function Gradient() {
  return (
    <CarouselSet
      title="Gradient carousel"
      variant="outline"
      carouselBgColor={{ name: 'primary', swatch: '500' }}
      gradient={true}
      Components={[
        {
          id: 1,
          ...fx.default,
          title: 'First item in the carousel.',
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
          title: 'Second item in the carousel.',
          description:
            'This second item in the carousel contains an extremely long description to test the layout and display. We want to ensure that even a very detailed and extended text remains readable and does not break the component’s design. Through this, we evaluate the limits and flexibility of the carousel in handling large amounts of content.',
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
          title: 'Third item in the carousel.',
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
          title: 'Fourth item in the carousel.',
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

export function Width() {
  return (
    <>
      <CarouselSet
        title="Width"
        width={{ name: 'xl' }}
        Components={[
          {
            id: 1,
            ...fx.default,
            title: 'First item in the carousel.',
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
            title: 'Second item in the carousel.',
            description:
              'This second item in the carousel contains an extremely long description to test the layout and display. We want to ensure that even a very detailed and extended text remains readable and does not break the component’s design. Through this, we evaluate the limits and flexibility of the carousel in handling large amounts of content.',
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
            title: 'Third item in the carousel.',
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
            title: 'Fourth item in the carousel.',
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
      <CarouselSet
        width={{ name: '3xl' }}
        Components={[
          {
            id: 1,
            ...fx.default,
            title: 'First item in the carousel.',
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
            title: 'Second item in the carousel.',
            description:
              'This second item in the carousel contains an extremely long description to test the layout and display. We want to ensure that even a very detailed and extended text remains readable and does not break the component’s design. Through this, we evaluate the limits and flexibility of the carousel in handling large amounts of content.',
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
            title: 'Third item in the carousel.',
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
            title: 'Fourth item in the carousel.',
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
    </>
  );
}
