import SkeletonCardSet from '@/src/app/[locale]/strapi/[pageSlug]/_components/SkeletonCardSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/SkeletonCardSet',
  component: SkeletonCardSet,
  decorators: [ProvidersDecorator],
};

export const Three = { args: { count: 3 } };
export const Six = { args: { count: 6 } };
