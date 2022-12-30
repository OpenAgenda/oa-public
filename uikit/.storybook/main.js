module.exports = {
  stories: [
    '../**/*.stories.mdx',
    '../**/*.stories.@(js|jsx|ts|tsx)',
  ],
  core: {
    builder: 'webpack5',
  },
  features: {
    emotionAlias: false,
  },
  // refs: {
  //   '@chakra-ui/react': {
  //     disable: true,
  //   },
  // },
};
