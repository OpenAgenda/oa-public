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
      ]}
    />
  );
}
