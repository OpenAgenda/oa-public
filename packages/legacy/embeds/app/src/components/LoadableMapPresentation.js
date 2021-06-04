import { loadable } from '@openagenda/react-shared';

export default loadable(
  () => import(/* webpackChunkName: "legacyEmbeds-MapPresentation" */ './MapPresentation'),
  { ssr: false }
);
