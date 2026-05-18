import loadableEsm from '@openagenda/react-shared/utils/loadableEsm';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext
      && import.meta.webpackContext('.', {
        recursive: true,
        regExp: /\.js$/,
        mode: 'weak',
      })
  : null;

export default loadableEsm(
  {
    chunkName: 'agendaLocations-LocationMap',
    importAsync: () =>
      import(
        /* webpackChunkName: "agendaLocations-LocationMap" */
        './LocationMap.js'
      ),
    // importSync:
    //   // eslint-disable-next-line camelcase
    //   typeof __webpack_require__ === 'undefined'
    //     ? await import('./LocationMap.js')
    //     : null,
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./LocationMap.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./LocationMap.js');
      }
    },
  },
  { ssr: false },
);
