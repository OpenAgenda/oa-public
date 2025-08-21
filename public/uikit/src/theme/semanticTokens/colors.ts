import { defineSemanticTokens } from '@chakra-ui/react';

export const semanticColors = defineSemanticTokens.colors({
  primary: {
    contrast: {
      value: { _light: 'white', _dark: 'white' },
    },
    fg: {
      value: { _light: '{colors.primary.600}', _dark: '{colors.primary.300}' },
    },
    subtle: {
      value: { _light: '{colors.primary.100}', _dark: '{colors.primary.900}' },
    },
    muted: {
      value: { _light: '{colors.primary.200}', _dark: '{colors.primary.800}' },
    },
    emphasized: {
      value: { _light: '{colors.primary.300}', _dark: '{colors.primary.700}' },
    },
    solid: {
      value: { _light: '{colors.primary.500}', _dark: '{colors.primary.500}' },
    },
    focusRing: {
      value: { _light: '{colors.primary.600}', _dark: '{colors.primary.600}' },
    },
  },
  oaGray: {
    contrast: {
      value: { _light: 'white', _dark: 'white' },
    },
    fg: {
      value: { _light: '{colors.oaGray.600}', _dark: '{colors.oaGray.300}' },
    },
    subtle: {
      value: { _light: '{colors.oaGray.100}', _dark: '{colors.oaGray.900}' },
    },
    muted: {
      value: { _light: '{colors.oaGray.200}', _dark: '{colors.oaGray.800}' },
    },
    emphasized: {
      value: { _light: '{colors.oaGray.300}', _dark: '{colors.oaGray.700}' },
    },
    solid: {
      value: { _light: '{colors.oaGray.600}', _dark: '{colors.oaGray.600}' },
    },
    focusRing: {
      value: { _light: '{colors.oaGray.600}', _dark: '{colors.oaGray.600}' },
    },
  },
  warning: {
    contrast: {
      value: { _light: 'white', _dark: 'white' },
    },
    fg: {
      value: { _light: '{colors.warning.600}', _dark: '{colors.warning.300}' },
    },
    subtle: {
      value: { _light: '{colors.warning.100}', _dark: '{colors.warning.900}' },
    },
    muted: {
      value: { _light: '{colors.warning.200}', _dark: '{colors.warning.800}' },
    },
    emphasized: {
      value: { _light: '{colors.warning.300}', _dark: '{colors.warning.700}' },
    },
    solid: {
      value: { _light: '{colors.warning.500}', _dark: '{colors.warning.500}' },
    },
    focusRing: {
      value: { _light: '{colors.warning.600}', _dark: '{colors.warning.600}' },
    },
  },
  danger: {
    contrast: {
      value: { _light: 'white', _dark: 'white' },
    },
    fg: {
      value: { _light: '{colors.danger.600}', _dark: '{colors.danger.300}' },
    },
    subtle: {
      value: { _light: '{colors.danger.100}', _dark: '{colors.danger.900}' },
    },
    muted: {
      value: { _light: '{colors.danger.200}', _dark: '{colors.danger.800}' },
    },
    emphasized: {
      value: { _light: '{colors.danger.300}', _dark: '{colors.danger.700}' },
    },
    solid: {
      value: { _light: '{colors.danger.500}', _dark: '{colors.danger.500}' },
    },
    focusRing: {
      value: { _light: '{colors.danger.600}', _dark: '{colors.danger.600}' },
    },
  },
  darkPurple: {
    contrast: {
      value: { _light: 'white', _dark: 'white' },
    },
    fg: {
      value: {
        _light: '{colors.darkPurple.700}',
        _dark: '{colors.darkPurple.300}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.darkPurple.100}',
        _dark: '{colors.darkPurple.900}',
      },
    },
    muted: {
      value: {
        _light: '{colors.darkPurple.200}',
        _dark: '{colors.darkPurple.800}',
      },
    },
    emphasized: {
      value: {
        _light: '{colors.darkPurple.300}',
        _dark: '{colors.darkPurple.700}',
      },
    },
    solid: {
      value: {
        _light: '{colors.darkPurple.600}',
        _dark: '{colors.darkPurple.600}',
      },
    },
    focusRing: {
      value: {
        _light: '{colors.darkPurple.600}',
        _dark: '{colors.darkPurple.600}',
      },
    },
  },

  strapi: {
    frenchBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.frenchBlue.600}',
          _dark: '{colors.frenchBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.frenchBlue.100}',
          _dark: '{colors.frenchBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.frenchBlue.200}',
          _dark: '{colors.frenchBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.frenchBlue.300}',
          _dark: '{colors.frenchBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.frenchBlue.500}',
          _dark: '{colors.frenchBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.frenchBlue.600}',
          _dark: '{colors.frenchBlue.600}',
        },
      },
    },
    celestialBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.celestialBlue.700}',
          _dark: '{colors.strapi.celestialBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.celestialBlue.50}',
          _dark: '{colors.strapi.celestialBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.celestialBlue.200}',
          _dark: '{colors.strapi.celestialBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.celestialBlue.300}',
          _dark: '{colors.strapi.celestialBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.celestialBlue.600}',
          _dark: '{colors.strapi.celestialBlue.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.celestialBlue.600}',
          _dark: '{colors.strapi.celestialBlue.600}',
        },
      },
    },
    gradientMoonStone: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.gradientMoonStone.700}',
          _dark: '{colors.strapi.gradientMoonStone.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.gradientMoonStone.50}',
          _dark: '{colors.strapi.gradientMoonStone.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.gradientMoonStone.200}',
          _dark: '{colors.strapi.gradientMoonStone.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.gradientMoonStone.300}',
          _dark: '{colors.strapi.gradientMoonStone.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.gradientMoonStone.600}',
          _dark: '{colors.strapi.gradientMoonStone.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.gradientMoonStone.600}',
          _dark: '{colors.strapi.gradientMoonStone.600}',
        },
      },
    },
    lightGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.lightGreen.700}',
          _dark: '{colors.strapi.lightGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.lightGreen.50}',
          _dark: '{colors.strapi.lightGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.lightGreen.200}',
          _dark: '{colors.strapi.lightGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.lightGreen.300}',
          _dark: '{colors.strapi.lightGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.lightGreen.600}',
          _dark: '{colors.strapi.lightGreen.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.lightGreen.600}',
          _dark: '{colors.strapi.lightGreen.600}',
        },
      },
    },
    vanilla: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.vanilla.600}',
          _dark: '{colors.vanilla.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.vanilla.100}',
          _dark: '{colors.vanilla.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.vanilla.200}',
          _dark: '{colors.vanilla.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.vanilla.300}',
          _dark: '{colors.vanilla.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.vanilla.500}',
          _dark: '{colors.vanilla.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.vanilla.600}',
          _dark: '{colors.vanilla.600}',
        },
      },
    },
    pictonBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.pictonBlue.600}',
          _dark: '{colors.pictonBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.pictonBlue.100}',
          _dark: '{colors.pictonBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.pictonBlue.200}',
          _dark: '{colors.pictonBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.pictonBlue.300}',
          _dark: '{colors.pictonBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.pictonBlue.500}',
          _dark: '{colors.pictonBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.pictonBlue.600}',
          _dark: '{colors.pictonBlue.600}',
        },
      },
    },
    azure: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: { _light: '{colors.azure.600}', _dark: '{colors.azure.300}' },
      },
      subtle: {
        value: { _light: '{colors.azure.100}', _dark: '{colors.azure.900}' },
      },
      muted: {
        value: { _light: '{colors.azure.200}', _dark: '{colors.azure.800}' },
      },
      emphasized: {
        value: { _light: '{colors.azure.300}', _dark: '{colors.azure.700}' },
      },
      solid: {
        value: { _light: '{colors.azure.500}', _dark: '{colors.azure.500}' },
      },
      focusRing: {
        value: { _light: '{colors.azure.600}', _dark: '{colors.azure.600}' },
      },
    },
    lightSkyBlue: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.lightSkyBlue.600}',
          _dark: '{colors.lightSkyBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.lightSkyBlue.100}',
          _dark: '{colors.lightSkyBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.lightSkyBlue.200}',
          _dark: '{colors.lightSkyBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.lightSkyBlue.300}',
          _dark: '{colors.lightSkyBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.lightSkyBlue.500}',
          _dark: '{colors.lightSkyBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.lightSkyBlue.600}',
          _dark: '{colors.lightSkyBlue.600}',
        },
      },
    },
    marianBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.marianBlue.600}',
          _dark: '{colors.marianBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.marianBlue.100}',
          _dark: '{colors.marianBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.marianBlue.200}',
          _dark: '{colors.marianBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.marianBlue.300}',
          _dark: '{colors.marianBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.marianBlue.500}',
          _dark: '{colors.marianBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.marianBlue.600}',
          _dark: '{colors.marianBlue.600}',
        },
      },
    },
    mayaBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.mayaBlue.600}',
          _dark: '{colors.mayaBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.mayaBlue.100}',
          _dark: '{colors.mayaBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.mayaBlue.200}',
          _dark: '{colors.mayaBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.mayaBlue.300}',
          _dark: '{colors.mayaBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.mayaBlue.500}',
          _dark: '{colors.mayaBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.mayaBlue.600}',
          _dark: '{colors.mayaBlue.600}',
        },
      },
    },
    bleuDeFrance: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.bleuDeFrance.600}',
          _dark: '{colors.bleuDeFrance.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.bleuDeFrance.100}',
          _dark: '{colors.bleuDeFrance.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.bleuDeFrance.200}',
          _dark: '{colors.bleuDeFrance.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.bleuDeFrance.300}',
          _dark: '{colors.bleuDeFrance.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.bleuDeFrance.500}',
          _dark: '{colors.bleuDeFrance.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.bleuDeFrance.600}',
          _dark: '{colors.bleuDeFrance.600}',
        },
      },
    },
    mediumSlateBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.mediumSlateBlue.600}',
          _dark: '{colors.mediumSlateBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.mediumSlateBlue.100}',
          _dark: '{colors.mediumSlateBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.mediumSlateBlue.200}',
          _dark: '{colors.mediumSlateBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.mediumSlateBlue.300}',
          _dark: '{colors.mediumSlateBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.mediumSlateBlue.500}',
          _dark: '{colors.mediumSlateBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.mediumSlateBlue.600}',
          _dark: '{colors.mediumSlateBlue.600}',
        },
      },
    },
    razzmatazz: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.razzmatazz.600}',
          _dark: '{colors.razzmatazz.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.razzmatazz.100}',
          _dark: '{colors.razzmatazz.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.razzmatazz.200}',
          _dark: '{colors.razzmatazz.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.razzmatazz.300}',
          _dark: '{colors.razzmatazz.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.razzmatazz.500}',
          _dark: '{colors.razzmatazz.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.razzmatazz.600}',
          _dark: '{colors.razzmatazz.600}',
        },
      },
    },
    carribeanCurrent: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.carribeanCurrent.600}',
          _dark: '{colors.carribeanCurrent.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.carribeanCurrent.100}',
          _dark: '{colors.carribeanCurrent.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.carribeanCurrent.200}',
          _dark: '{colors.carribeanCurrent.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.carribeanCurrent.300}',
          _dark: '{colors.carribeanCurrent.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.carribeanCurrent.500}',
          _dark: '{colors.carribeanCurrent.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.carribeanCurrent.600}',
          _dark: '{colors.carribeanCurrent.600}',
        },
      },
    },
    persianGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.persianGreen.600}',
          _dark: '{colors.persianGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.persianGreen.100}',
          _dark: '{colors.persianGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.persianGreen.200}',
          _dark: '{colors.persianGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.persianGreen.300}',
          _dark: '{colors.persianGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.persianGreen.500}',
          _dark: '{colors.persianGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.persianGreen.600}',
          _dark: '{colors.persianGreen.600}',
        },
      },
    },
    ashGray: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.ashGray.600}',
          _dark: '{colors.ashGray.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.ashGray.100}',
          _dark: '{colors.ashGray.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.ashGray.200}',
          _dark: '{colors.ashGray.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.ashGray.300}',
          _dark: '{colors.ashGray.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.ashGray.500}',
          _dark: '{colors.ashGray.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.ashGray.600}',
          _dark: '{colors.ashGray.600}',
        },
      },
    },
    burntOrange: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.burntOrange.600}',
          _dark: '{colors.burntOrange.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.burntOrange.100}',
          _dark: '{colors.burntOrange.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.burntOrange.200}',
          _dark: '{colors.burntOrange.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.burntOrange.300}',
          _dark: '{colors.burntOrange.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.burntOrange.500}',
          _dark: '{colors.burntOrange.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.burntOrange.600}',
          _dark: '{colors.burntOrange.600}',
        },
      },
    },
    darkCyan: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.darkCyan.600}',
          _dark: '{colors.darkCyan.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.darkCyan.100}',
          _dark: '{colors.darkCyan.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.darkCyan.200}',
          _dark: '{colors.darkCyan.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.darkCyan.300}',
          _dark: '{colors.darkCyan.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.darkCyan.500}',
          _dark: '{colors.darkCyan.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.darkCyan.600}',
          _dark: '{colors.darkCyan.600}',
        },
      },
    },
    aquamarine: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.aquamarine.600}',
          _dark: '{colors.aquamarine.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.aquamarine.100}',
          _dark: '{colors.aquamarine.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.aquamarine.200}',
          _dark: '{colors.aquamarine.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.aquamarine.300}',
          _dark: '{colors.aquamarine.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.aquamarine.500}',
          _dark: '{colors.aquamarine.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.aquamarine.600}',
          _dark: '{colors.aquamarine.600}',
        },
      },
    },
    mint: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: { _light: '{colors.mint.600}', _dark: '{colors.mint.300}' },
      },
      subtle: {
        value: { _light: '{colors.mint.100}', _dark: '{colors.mint.900}' },
      },
      muted: {
        value: { _light: '{colors.mint.200}', _dark: '{colors.mint.800}' },
      },
      emphasized: {
        value: { _light: '{colors.mint.300}', _dark: '{colors.mint.700}' },
      },
      solid: {
        value: { _light: '{colors.mint.500}', _dark: '{colors.mint.500}' },
      },
      focusRing: {
        value: { _light: '{colors.mint.600}', _dark: '{colors.mint.600}' },
      },
    },
    skipSeaGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.skipSeaGreen.600}',
          _dark: '{colors.skipSeaGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.skipSeaGreen.100}',
          _dark: '{colors.skipSeaGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.skipSeaGreen.200}',
          _dark: '{colors.skipSeaGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.skipSeaGreen.300}',
          _dark: '{colors.skipSeaGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.skipSeaGreen.500}',
          _dark: '{colors.skipSeaGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.skipSeaGreen.600}',
          _dark: '{colors.skipSeaGreen.600}',
        },
      },
    },
    naturalAliceBlue: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.naturalAliceBlue.600}',
          _dark: '{colors.naturalAliceBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.naturalAliceBlue.100}',
          _dark: '{colors.naturalAliceBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.naturalAliceBlue.200}',
          _dark: '{colors.naturalAliceBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.naturalAliceBlue.300}',
          _dark: '{colors.naturalAliceBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.naturalAliceBlue.500}',
          _dark: '{colors.naturalAliceBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.naturalAliceBlue.600}',
          _dark: '{colors.naturalAliceBlue.600}',
        },
      },
    },
    ruddyBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.ruddyBlue.600}',
          _dark: '{colors.ruddyBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.ruddyBlue.100}',
          _dark: '{colors.ruddyBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.ruddyBlue.200}',
          _dark: '{colors.ruddyBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.ruddyBlue.300}',
          _dark: '{colors.ruddyBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.ruddyBlue.500}',
          _dark: '{colors.ruddyBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.ruddyBlue.600}',
          _dark: '{colors.ruddyBlue.600}',
        },
      },
    },
    sepia: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: { _light: '{colors.sepia.600}', _dark: '{colors.sepia.300}' },
      },
      subtle: {
        value: { _light: '{colors.sepia.100}', _dark: '{colors.sepia.900}' },
      },
      muted: {
        value: { _light: '{colors.sepia.200}', _dark: '{colors.sepia.800}' },
      },
      emphasized: {
        value: { _light: '{colors.sepia.300}', _dark: '{colors.sepia.700}' },
      },
      solid: {
        value: { _light: '{colors.sepia.500}', _dark: '{colors.sepia.500}' },
      },
      focusRing: {
        value: { _light: '{colors.sepia.600}', _dark: '{colors.sepia.600}' },
      },
    },
    goldenBrown: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.goldenBrown.600}',
          _dark: '{colors.goldenBrown.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.goldenBrown.100}',
          _dark: '{colors.goldenBrown.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.goldenBrown.200}',
          _dark: '{colors.goldenBrown.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.goldenBrown.300}',
          _dark: '{colors.goldenBrown.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.goldenBrown.500}',
          _dark: '{colors.goldenBrown.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.goldenBrown.600}',
          _dark: '{colors.goldenBrown.600}',
        },
      },
    },
    satinSheetGold: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.satinSheetGold.600}',
          _dark: '{colors.satinSheetGold.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.satinSheetGold.100}',
          _dark: '{colors.satinSheetGold.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.satinSheetGold.200}',
          _dark: '{colors.satinSheetGold.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.satinSheetGold.300}',
          _dark: '{colors.satinSheetGold.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.satinSheetGold.500}',
          _dark: '{colors.satinSheetGold.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.satinSheetGold.600}',
          _dark: '{colors.satinSheetGold.600}',
        },
      },
    },
    charcoal: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.charcoal.600}',
          _dark: '{colors.strapi.charcoal.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.charcoal.100}',
          _dark: '{colors.strapi.charcoal.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.charcoal.200}',
          _dark: '{colors.strapi.charcoal.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.charcoal.300}',
          _dark: '{colors.strapi.charcoal.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.charcoal.500}',
          _dark: '{colors.strapi.charcoal.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.charcoal.600}',
          _dark: '{colors.strapi.charcoal.600}',
        },
      },
    },
    turquoise: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.turquoise.600}',
          _dark: '{colors.strapi.turquoise.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.turquoise.100}',
          _dark: '{colors.strapi.turquoise.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.turquoise.200}',
          _dark: '{colors.strapi.turquoise.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.turquoise.300}',
          _dark: '{colors.strapi.turquoise.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.turquoise.500}',
          _dark: '{colors.strapi.turquoise.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.turquoise.600}',
          _dark: '{colors.strapi.turquoise.600}',
        },
      },
    },
    icterine: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.icterine.600}',
          _dark: '{colors.strapi.icterine.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.icterine.100}',
          _dark: '{colors.strapi.icterine.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.icterine.200}',
          _dark: '{colors.strapi.icterine.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.icterine.300}',
          _dark: '{colors.strapi.icterine.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.icterine.500}',
          _dark: '{colors.strapi.icterine.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.icterine.600}',
          _dark: '{colors.strapi.icterine.600}',
        },
      },
    },
    squashAtomicTangerine: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.squashAtomicTangerine.600}',
          _dark: '{colors.strapi.squashAtomicTangerine.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.squashAtomicTangerine.100}',
          _dark: '{colors.strapi.squashAtomicTangerine.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.squashAtomicTangerine.200}',
          _dark: '{colors.strapi.squashAtomicTangerine.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.squashAtomicTangerine.300}',
          _dark: '{colors.strapi.squashAtomicTangerine.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.squashAtomicTangerine.500}',
          _dark: '{colors.strapi.squashAtomicTangerine.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.squashAtomicTangerine.600}',
          _dark: '{colors.strapi.squashAtomicTangerine.600}',
        },
      },
    },
    mulberry: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.mulberry.600}',
          _dark: '{colors.strapi.mulberry.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.mulberry.100}',
          _dark: '{colors.strapi.mulberry.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.mulberry.200}',
          _dark: '{colors.strapi.mulberry.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.mulberry.300}',
          _dark: '{colors.strapi.mulberry.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.mulberry.500}',
          _dark: '{colors.strapi.mulberry.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.mulberry.600}',
          _dark: '{colors.strapi.mulberry.600}',
        },
      },
    },
    threedomPigmentGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.threedomPigmentGreen.600}',
          _dark: '{colors.strapi.threedomPigmentGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.threedomPigmentGreen.100}',
          _dark: '{colors.strapi.threedomPigmentGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.threedomPigmentGreen.200}',
          _dark: '{colors.strapi.threedomPigmentGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.threedomPigmentGreen.300}',
          _dark: '{colors.strapi.threedomPigmentGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.threedomPigmentGreen.500}',
          _dark: '{colors.strapi.threedomPigmentGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.threedomPigmentGreen.600}',
          _dark: '{colors.strapi.threedomPigmentGreen.600}',
        },
      },
    },
    collectivePersianBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.collectivePersianBlue.600}',
          _dark: '{colors.strapi.collectivePersianBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.collectivePersianBlue.100}',
          _dark: '{colors.strapi.collectivePersianBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.collectivePersianBlue.200}',
          _dark: '{colors.strapi.collectivePersianBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.collectivePersianBlue.300}',
          _dark: '{colors.strapi.collectivePersianBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.collectivePersianBlue.500}',
          _dark: '{colors.strapi.collectivePersianBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.collectivePersianBlue.600}',
          _dark: '{colors.strapi.collectivePersianBlue.600}',
        },
      },
    },
    royalBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.royalBlue.700}',
          _dark: '{colors.strapi.royalBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.royalBlue.100}',
          _dark: '{colors.strapi.royalBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.royalBlue.200}',
          _dark: '{colors.strapi.royalBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.royalBlue.300}',
          _dark: '{colors.strapi.royalBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.royalBlue.600}',
          _dark: '{colors.strapi.royalBlue.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.royalBlue.600}',
          _dark: '{colors.strapi.royalBlue.600}',
        },
      },
    },
    amethyst: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.amethyst.700}',
          _dark: '{colors.strapi.amethyst.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.amethyst.100}',
          _dark: '{colors.strapi.amethyst.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.amethyst.200}',
          _dark: '{colors.strapi.amethyst.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.amethyst.300}',
          _dark: '{colors.strapi.amethyst.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.amethyst.600}',
          _dark: '{colors.strapi.amethyst.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.amethyst.600}',
          _dark: '{colors.strapi.amethyst.600}',
        },
      },
    },
    pompAndPower: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.pompAndPower.700}',
          _dark: '{colors.strapi.pompAndPower.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.pompAndPower.100}',
          _dark: '{colors.strapi.pompAndPower.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.pompAndPower.200}',
          _dark: '{colors.strapi.pompAndPower.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.pompAndPower.300}',
          _dark: '{colors.strapi.pompAndPower.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.pompAndPower.600}',
          _dark: '{colors.strapi.pompAndPower.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.pompAndPower.600}',
          _dark: '{colors.strapi.pompAndPower.600}',
        },
      },
    },
    pompAndPowerer: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.pompAndPowerer.700}',
          _dark: '{colors.strapi.pompAndPowerer.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.pompAndPowerer.100}',
          _dark: '{colors.strapi.pompAndPowerer.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.pompAndPowerer.200}',
          _dark: '{colors.strapi.pompAndPowerer.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.pompAndPowerer.300}',
          _dark: '{colors.strapi.pompAndPowerer.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.pompAndPowerer.600}',
          _dark: '{colors.strapi.pompAndPowerer.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.pompAndPowerer.600}',
          _dark: '{colors.strapi.pompAndPowerer.600}',
        },
      },
    },
    spotVistaBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.spotVistaBlue.600}',
          _dark: '{colors.spotVistaBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.spotVistaBlue.100}',
          _dark: '{colors.spotVistaBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.spotVistaBlue.200}',
          _dark: '{colors.spotVistaBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.spotVistaBlue.300}',
          _dark: '{colors.spotVistaBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.spotVistaBlue.500}',
          _dark: '{colors.spotVistaBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.spotVistaBlue.600}',
          _dark: '{colors.spotVistaBlue.600}',
        },
      },
    },
    spotAliceBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.spotAliceBlue.600}',
          _dark: '{colors.spotAliceBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.spotAliceBlue.100}',
          _dark: '{colors.spotAliceBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.spotAliceBlue.200}',
          _dark: '{colors.spotAliceBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.spotAliceBlue.300}',
          _dark: '{colors.spotAliceBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.spotAliceBlue.500}',
          _dark: '{colors.spotAliceBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.spotAliceBlue.600}',
          _dark: '{colors.spotAliceBlue.600}',
        },
      },
    },
    goldenRod: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.goldenRod.600}',
          _dark: '{colors.goldenRod.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.goldenRod.100}',
          _dark: '{colors.goldenRod.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.goldenRod.200}',
          _dark: '{colors.goldenRod.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.goldenRod.300}',
          _dark: '{colors.goldenRod.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.goldenRod.500}',
          _dark: '{colors.goldenRod.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.goldenRod.600}',
          _dark: '{colors.goldenRod.600}',
        },
      },
    },
    papayaWhip: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.papayaWhip.600}',
          _dark: '{colors.papayaWhip.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.papayaWhip.100}',
          _dark: '{colors.papayaWhip.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.papayaWhip.200}',
          _dark: '{colors.papayaWhip.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.papayaWhip.300}',
          _dark: '{colors.papayaWhip.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.papayaWhip.500}',
          _dark: '{colors.papayaWhip.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.papayaWhip.600}',
          _dark: '{colors.papayaWhip.600}',
        },
      },
    },
    coyote: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.coyote.600}',
          _dark: '{colors.coyote.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.coyote.100}',
          _dark: '{colors.coyote.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.coyote.200}',
          _dark: '{colors.coyote.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.coyote.300}',
          _dark: '{colors.coyote.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.coyote.500}',
          _dark: '{colors.coyote.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.coyote.600}',
          _dark: '{colors.coyote.600}',
        },
      },
    },
    cadetGray: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.cadetGray.600}',
          _dark: '{colors.cadetGray.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.cadetGray.100}',
          _dark: '{colors.cadetGray.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.cadetGray.200}',
          _dark: '{colors.cadetGray.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.cadetGray.300}',
          _dark: '{colors.cadetGray.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.cadetGray.500}',
          _dark: '{colors.cadetGray.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.cadetGray.600}',
          _dark: '{colors.cadetGray.600}',
        },
      },
    },
    fuchsiaRose: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.fuchsiaRose.600}',
          _dark: '{colors.fuchsiaRose.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.fuchsiaRose.100}',
          _dark: '{colors.fuchsiaRose.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.fuchsiaRose.200}',
          _dark: '{colors.fuchsiaRose.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.fuchsiaRose.300}',
          _dark: '{colors.fuchsiaRose.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.fuchsiaRose.500}',
          _dark: '{colors.fuchsiaRose.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.fuchsiaRose.600}',
          _dark: '{colors.fuchsiaRose.600}',
        },
      },
    },
    tickleMePink: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.tickleMePink.600}',
          _dark: '{colors.tickleMePink.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.tickleMePink.100}',
          _dark: '{colors.tickleMePink.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.tickleMePink.200}',
          _dark: '{colors.tickleMePink.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.tickleMePink.300}',
          _dark: '{colors.tickleMePink.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.tickleMePink.500}',
          _dark: '{colors.tickleMePink.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.tickleMePink.600}',
          _dark: '{colors.tickleMePink.600}',
        },
      },
    },
    myrtleGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.myrtleGreen.600}',
          _dark: '{colors.myrtleGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.myrtleGreen.100}',
          _dark: '{colors.myrtleGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.myrtleGreen.200}',
          _dark: '{colors.myrtleGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.myrtleGreen.300}',
          _dark: '{colors.myrtleGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.myrtleGreen.500}',
          _dark: '{colors.myrtleGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.myrtleGreen.600}',
          _dark: '{colors.myrtleGreen.600}',
        },
      },
    },
    cubeVanilla: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.cubeVanilla.600}',
          _dark: '{colors.cubeVanilla.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.cubeVanilla.100}',
          _dark: '{colors.cubeVanilla.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.cubeVanilla.200}',
          _dark: '{colors.cubeVanilla.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.cubeVanilla.300}',
          _dark: '{colors.cubeVanilla.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.cubeVanilla.500}',
          _dark: '{colors.cubeVanilla.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.cubeVanilla.600}',
          _dark: '{colors.cubeVanilla.600}',
        },
      },
    },
    chiliRed: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.chiliRed.600}',
          _dark: '{colors.chiliRed.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.chiliRed.100}',
          _dark: '{colors.chiliRed.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.chiliRed.200}',
          _dark: '{colors.chiliRed.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.chiliRed.300}',
          _dark: '{colors.chiliRed.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.chiliRed.500}',
          _dark: '{colors.chiliRed.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.chiliRed.600}',
          _dark: '{colors.chiliRed.600}',
        },
      },
    },
    seaGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.seaGreen.600}',
          _dark: '{colors.seaGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.seaGreen.100}',
          _dark: '{colors.seaGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.seaGreen.200}',
          _dark: '{colors.seaGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.seaGreen.300}',
          _dark: '{colors.seaGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.seaGreen.500}',
          _dark: '{colors.seaGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.seaGreen.600}',
          _dark: '{colors.seaGreen.600}',
        },
      },
    },
    vistaBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.vistaBlue.600}',
          _dark: '{colors.vistaBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.vistaBlue.100}',
          _dark: '{colors.vistaBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.vistaBlue.200}',
          _dark: '{colors.vistaBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.vistaBlue.300}',
          _dark: '{colors.vistaBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.vistaBlue.500}',
          _dark: '{colors.vistaBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.vistaBlue.600}',
          _dark: '{colors.vistaBlue.600}',
        },
      },
    },
    discreetAliceBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.discreetAliceBlue.600}',
          _dark: '{colors.discreetAliceBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.discreetAliceBlue.100}',
          _dark: '{colors.discreetAliceBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.discreetAliceBlue.200}',
          _dark: '{colors.discreetAliceBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.discreetAliceBlue.300}',
          _dark: '{colors.discreetAliceBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.discreetAliceBlue.500}',
          _dark: '{colors.discreetAliceBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.discreetAliceBlue.600}',
          _dark: '{colors.discreetAliceBlue.600}',
        },
      },
    },
  },
  states: {
    refused: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.states.refused}',
          _dark: '{colors.states.refused}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.states.refused}',
          _dark: '{colors.states.refused}',
        },
      },
      muted: {
        value: {
          _light: '{colors.states.refused}',
          _dark: '{colors.states.refused}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.states.refused}',
          _dark: '{colors.states.refused}',
        },
      },
      solid: {
        value: {
          _light: '{colors.states.refused}',
          _dark: '{colors.states.refused}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.states.refused}',
          _dark: '{colors.states.refused}',
        },
      },
    },
    toControl: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.states.toControl}',
          _dark: '{colors.states.toControl}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.states.toControl}',
          _dark: '{colors.states.toControl}',
        },
      },
      muted: {
        value: {
          _light: '{colors.states.toControl}',
          _dark: '{colors.states.toControl}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.states.toControl}',
          _dark: '{colors.states.toControl}',
        },
      },
      solid: {
        value: {
          _light: '{colors.states.toControl}',
          _dark: '{colors.states.toControl}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.states.toControl}',
          _dark: '{colors.states.toControl}',
        },
      },
    },
    controlled: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.states.controlled}',
          _dark: '{colors.states.controlled}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.states.controlled}',
          _dark: '{colors.states.controlled}',
        },
      },
      muted: {
        value: {
          _light: '{colors.states.controlled}',
          _dark: '{colors.states.controlled}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.states.controlled}',
          _dark: '{colors.states.controlled}',
        },
      },
      solid: {
        value: {
          _light: '{colors.states.controlled}',
          _dark: '{colors.states.controlled}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.states.controlled}',
          _dark: '{colors.states.controlled}',
        },
      },
    },
    published: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.states.published}',
          _dark: '{colors.states.published}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.states.published}',
          _dark: '{colors.states.published}',
        },
      },
      muted: {
        value: {
          _light: '{colors.states.published}',
          _dark: '{colors.states.published}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.states.published}',
          _dark: '{colors.states.published}',
        },
      },
      solid: {
        value: {
          _light: '{colors.states.published}',
          _dark: '{colors.states.published}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.states.published}',
          _dark: '{colors.states.published}',
        },
      },
    },
  },
});
