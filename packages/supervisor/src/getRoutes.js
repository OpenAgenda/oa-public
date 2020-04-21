import loadable from '@openagenda/react-utils/dist/loadable';

const App = loadable(() => import(/* webpackChunkName: "supervisor-App" */ './containers/App'));

export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: App
    }
  ];
}
