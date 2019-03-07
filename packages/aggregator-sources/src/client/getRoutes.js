import NotFound from '@openagenda/react-utils/dist/NotFound';
import { App, Dashboard } from './containers';

export default function ( prefix = '', notFoundKey = 'aggregatorSources' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Dashboard },
        { component: NotFound, notFoundKey }
      ]
    }
  ];
};
