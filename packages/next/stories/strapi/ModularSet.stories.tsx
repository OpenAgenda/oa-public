import ModularSet from 'components/strapi/ModularSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/ModularSet',
  decorators: [ProvidersDecorator],
};

export function Colors() {
  return (
    <ModularSet
      title="The modularSet title is blue"
      description="The modularSet description is black"
      titleColor={{
        name: 'blue',
        swatch: '500',
      }}
      descriptionColor={{ name: 'black' }}
      alignHeight
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
        {
          id: 3,
          ...fx.default,
          title: 'The modular title is black',
          description: 'The modular description is grey',
          titleColor: { name: 'black' },
          descriptionColor: { name: 'grey' },
          card: true,
        },
        {
          id: 4,
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

export function Multiple() {
  return (
    <ModularSet
      title="The modularSet has more than four components"
      minColumnWidth="100px"
      Components={[
        {
          id: 1,
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
        },
        {
          id: 2,
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
        },
        {
          id: 3,
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
        },
        {
          id: 4,
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
        },
        {
          id: 5,
          Illustration: {
            image: {
              url: '/tinyPhteven.jpg',
            },
          },
        },
      ]}
    />
  );
}
