import Modular from 'components/strapi/Modular';
import ModularSet from 'components/strapi/ModularSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import PageContainerDecorator from './decorators/PageContainerDecorator';

import modularFixture from './fixtures/modular.json';

export default {
  title: 'strapi/Modular',
  component: Modular,
  decorators: [PageContainerDecorator, ProvidersDecorator],
};

export const basic = {
  args: modularFixture.default,
};
export const basicCard = {
  args: { ...modularFixture.default, card: true },
};

export const JustAnImage = {
  args: modularFixture.justAnImage,
};

export const AnImageAndATitle = {
  args: modularFixture.anImageAndATitle,
};

export const JustADescription = {
  args: modularFixture.justADescription,
};

export const Set = () => (
  <ModularSet
    title="Wigglypoof"
    Components={Object.values(modularFixture)}
    CTA={null}
  />
);
