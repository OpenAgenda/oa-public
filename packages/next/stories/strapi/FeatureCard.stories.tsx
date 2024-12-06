import FeatureCard from 'components/strapi/FeatureCard';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import featureCardFixture from './fixtures/featureCard.json';

export default {
  title: 'strapi/FeatureCard',
  component: FeatureCard,
  decorators: [ProvidersDecorator],
};

export const Default = {
  args: featureCardFixture
};