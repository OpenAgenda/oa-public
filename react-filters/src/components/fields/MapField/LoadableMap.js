import loadable from '@openagenda/react-shared/dist/utils/loadable.js';

// // eslint-disable-next-line camelcase
// const contextRequire = typeof __webpack_require__ !== 'undefined'
//   ? import.meta.webpackContext('.', {
//     recursive: true,
//     regExp: /\.js$/,
//     mode: 'weak',
//   }) : null;
//
// const LoadableMapField = loadableComponent(
//   {
//     chunkName: 'reactFilters-Map',
//     importAsync: () =>
//       import(
//         /* webpackChunkName: "reactFilters-Map" */
//         './Map.js'
//       ),
//     resolve: () => {
//       if (contextRequire) {
//         return contextRequire.resolve('./Map.js');
//       }
//       const { resolve } = import.meta;
//       if (typeof resolve === 'function') {
//         return resolve('./Map.js');
//       }
//     },
//   },
//   { ssr: false },
// );

const LoadableMapField = loadable(
  () => import(/* webpackChunkName: "reactFilters-Map" */ './Map.js'),
  { ssr: false },
);

export default LoadableMapField;
