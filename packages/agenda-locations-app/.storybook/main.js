module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  webpackFinal(config) {
    config.optimization.splitChunks.chunks = 'initial';
    return config;
  },
  core: {
    builder: 'webpack5',
  }
};
