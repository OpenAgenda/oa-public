module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
  core: {
    builder: 'webpack5',
  },
};
