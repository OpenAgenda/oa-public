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
    strictMode: true,
  },
};
