module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  webpackFinal(config) {
    config.optimization.splitChunks.chunks = 'initial';
    return config;
  }
/*   core: {
    builder: 'webpack5',
  },
  webpackFinal(config) {
    config.optimization.splitChunks.chunks = 'initial';
    config.module.rules.push({
      test: /\.(js|mjs|jsx)$/,
      enforce: 'pre',
      loader: require.resolve('source-map-loader'),
      resolve: {
        fullySpecified: false
      }
    });

    return config;
  }*/
};
