module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  core: {
    builder: 'webpack5',
  },
  webpackFinal(config) {
    config.module.rules.push({
      test: /\.(js|mjs|jsx)$/,
      enforce: 'pre',
      loader: require.resolve('source-map-loader'),
      resolve: {
        fullySpecified: false
      }
    });

    return config;
  }
};
