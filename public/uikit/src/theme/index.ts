import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { globalCss } from './globalCss';
import { recipes } from './recipes';
import { slotRecipes } from './slotRecipes';
import { semanticColors } from './semanticTokens/colors';
import { colors } from './tokens/colors';
import { cursor } from './tokens/cursor';
import { fonts } from './tokens/fonts';

// FROM https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/theme/index.ts

const themeConfig = defineConfig({
  cssVarsPrefix: 'oa',
  globalCss,
  theme: {
    tokens: {
      colors,
      cursor,
      fonts,
    },
    semanticTokens: {
      colors: semanticColors,
    },
    recipes,
    slotRecipes,
  },
});

export const system = createSystem(defaultConfig, themeConfig);

export type System = typeof system;

export default system;
