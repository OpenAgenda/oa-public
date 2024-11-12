import { loadableComponent } from '@openagenda/react-shared';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext('.', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'weak',
  })
  : null;

const App = loadableComponent({
  chunkName: 'supervisor-App',
  importAsync: () =>
    import(
      /* webpackChunkName: "supervisor-App" */
      './containers/App.js'
    ),
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./containers/App.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./containers/App.js');
    }
  },
});

export default (prefix = '') => [
  {
    path: prefix,
    component: App,
  },
];
