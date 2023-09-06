import loadable from '@openagenda/react-shared/lib/utils/loadable';

const LoadableMapField = loadable(
  () => import(/* webpackChunkName: "reactFilters-Map" */ './Map'),
  { ssr: false },
);

export default LoadableMapField;
