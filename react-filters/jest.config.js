export default {
  // `type: module` in package.json only makes `.js` files ESM; it says nothing
  // about `.jsx`. Without this, jest falls back to CJS for them.
  extensionsToTreatAsEsm: ['.jsx'],
  // JSX only: no preset-env, so module syntax is left untouched and the
  // workspace keeps running as native ESM. `.babelrc.cjs` is for the webpack
  // build and stays out of it.
  transform: {
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        babelrc: false,
        presets: [['@babel/preset-react', { runtime: 'automatic' }]],
      },
    ],
  },
};
