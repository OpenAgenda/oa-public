'use strict';

module.exports = {
  stories: ['../stories/*.stories.@(js|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/preset-scss'],
  core: {
    builder: 'webpack5',
  }
};
