import { loadable } from '@openagenda/react-shared';

const LoadableMapField = loadable(
  () => import(/* webpackChunkName: "reactFilters-MapField" */ './MapField'),
  { ssr: false }
);

export default LoadableMapField;
