import Illustration from 'components/strapi/Illustration';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Illustration',
  component: Illustration,
  decorators: [ProvidersDecorator],
};

export const WithoutAltText = {
  args: {
    image: {
      url: '/Main_Image_A3_0cc920c64c.jpg',
    },
  },
};
