import loadableEsm from '@openagenda/react-shared/src/utils/loadableEsm.mjs';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext
  && import.meta.webpackContext('.', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'weak',
  })
  : null;

export default loadableEsm({
  chunkName: 'legacyEmbeds-MapPresentation',
  importAsync: () =>
    import(
      /* webpackChunkName: "legacyEmbeds-MapPresentation" */
      './MapPresentation.js'
    ),
  // importSync:
  //   // eslint-disable-next-line camelcase
  //   typeof __webpack_require__ === 'undefined'
  //     ? await import('./MapPresentation.js')
  //     : null,
  resolve: () => {
    if (contextRequire) {
      return contextRequire.resolve('./MapPresentation.js');
    }
    const { resolve } = import.meta;
    if (typeof resolve === 'function') {
      return resolve('./MapPresentation.js');
    }
  },
}, { ssr: false });
