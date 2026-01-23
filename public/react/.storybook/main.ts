import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-webpack5';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(pkg: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${pkg}/package.json`)));
}

const config: StorybookConfig = {
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },

  stories: ['../stories/*.mdx', '../stories/*.stories.@(js|jsx|mjs|ts|tsx)'],

  staticDirs: ['./public'],

  babel: (config: any) => {
    return { ...config, rootMode: 'upward' };
  },

  webpackFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.plugins ??= [];

    config.resolve.plugins.push(
      new TsconfigPathsPlugin({
        configFile: join(import.meta.dirname, '../tsconfig.json'),
      }),
    );

    return config;
  },

  addons: [getAbsolutePath('@storybook/addon-webpack5-compiler-babel')],

  refs: {
    '@chakra-ui/react': {
      disable: true,
    },
  },
};

export default config;
