import loadable from '@openagenda/react-shared/lib/utils/loadable';

const LoadableLocationMap = loadable(
  () => import(/* webpackChunkName: "agenda-locations-LocationMap" */ './LocationMap'),
  { ssr: false }
);

export default LoadableLocationMap;
