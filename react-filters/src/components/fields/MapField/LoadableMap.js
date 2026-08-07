import loadable from '@openagenda/react-shared/utils/loadable';

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
//         './Map.jsx'
//       ),
//     resolve: () => {
//       if (contextRequire) {
//         return contextRequire.resolve('./Map.jsx');
//       }
//       const { resolve } = import.meta;
//       if (typeof resolve === 'function') {
//         return resolve('./Map.jsx');
//       }
//     },
//   },
//   { ssr: false },
// );

const LoadableMapField = loadable(
  () => import(/* webpackChunkName: "reactFilters-Map" */ './Map.jsx'),
  { ssr: false },
);

export default LoadableMapField;
