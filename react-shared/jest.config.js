export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  // `type: module` in package.json only makes `.js` files ESM; it says nothing
  // about `.jsx`. Without this, jest falls back to CJS for them and blows up
  // requiring a module the graph is already loading through `import()`.
  extensionsToTreatAsEsm: ['.jsx'],
  // JSX only: no preset-env, so module syntax is left untouched and the
  // workspace keeps running as native ESM.
  transform: {
    '^.+\\.jsx?$': [
      'babel-jest',
      { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
    ],
  },
};
