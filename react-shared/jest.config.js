export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  // JSX only: no preset-env, so module syntax is left untouched and the
  // workspace keeps running as native ESM.
  transform: {
    '^.+\\.jsx?$': [
      'babel-jest',
      { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
    ],
  },
};
