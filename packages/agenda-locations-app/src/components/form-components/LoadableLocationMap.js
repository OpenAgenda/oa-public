import { loadable } from '@openagenda/react-shared';

export default loadable(
  () => import(/* webpackChunkName: "legacyEmbeds-LocationMap" */ './LocationMap'),
  { ssr: false }
);