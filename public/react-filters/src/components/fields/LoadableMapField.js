import loadable from '@openagenda/react-shared/lib/utils/loadable';

const LoadableMapField = loadable(
  () => import(/* webpackChunkName: "reactFilters-MapField" */ './MapField'),
  { ssr: false }
);

export default LoadableMapField;
