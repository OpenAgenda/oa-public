import { join, dirname } from 'node:path';
import type { StorybookConfig } from '@storybook/react-webpack5';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },

  stories: ['../stories/*.mdx', '../stories/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
  ],

  refs: {
    '@chakra-ui/react': {
      disable: true,
    },
  },
};

export default config;
