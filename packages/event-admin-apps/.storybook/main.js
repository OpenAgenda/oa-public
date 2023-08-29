module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  core: {
    builder: 'webpack5',
  },
  reactOptions: {
    fastRefresh: true,
    // strictMode: true,
  },
  staticDirs: ['./public'],
  webpackFinal(config) {
    config.module.rules.push({
      test: /\.(js|mjs|jsx)$/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};
