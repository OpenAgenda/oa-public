import CTAButton from 'components/strapi/CTAButton';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/CTAButton',
  component: CTAButton,
  decorators: [ProvidersDecorator],
};

export const Primary = {
  args: {
    label: 'Learn More',
    link: '/about',
  },
};

export const ExternalLink = {
  args: {
    label: 'Visit Website',
    link: 'https://example.com',
  },
};

export const LongLabel = {
  args: {
    label: 'Click here to discover more about our services',
    link: '/services',
  },
};
