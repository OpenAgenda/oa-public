module.exports = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  staticDirs: ['./public'],
  core: {
    builder: 'webpack5',
  },
};
