import Illustration from 'components/strapi/Illustration';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Illustration',
  component: Illustration,
  decorators: [ProvidersDecorator],
};

export const Basic = {
  args: {
    image: {
      url: '/Main_Image_A3_0cc920c64c.jpg',
    },
    maxWidth: 'xs',
  },
};

export const Circular = {
  args: {
    image: {
      url: '/SquarePhteven.jpg',
    },
    borderRadius: 'full',
    maxWidth: 'sm',
  },
};
