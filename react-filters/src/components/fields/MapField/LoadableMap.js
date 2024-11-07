import { loadable } from '@openagenda/react-shared';

const LoadableMapField = loadable(
  () => import(/* webpackChunkName: "reactFilters-Map" */ './Map.js'),
  { ssr: false },
);

export default LoadableMapField;
