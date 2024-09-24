import { loadable } from '@openagenda/react-shared';

const App = loadable(
  () => import(/* webpackChunkName: "supervisor-App" */ './containers/App'),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
  },
];
