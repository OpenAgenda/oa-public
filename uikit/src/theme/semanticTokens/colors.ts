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
  oaWhite: {
    contrast: {
      value: { _light: 'white', _dark: 'white' },
    },
    fg: {
      value: { _light: '{colors.oaGray.1}', _dark: '{colors.oaGray.1}' },
    },
    subtle: {
      value: { _light: 'transparent', _dark: 'transparent' },
    },
    muted: {
      value: { _light: '{colors.oaGray.1}', _dark: '{colors.oaGray.1}' },
    },
    emphasized: {
      value: { _light: '{colors.oaGray.1}', _dark: '{colors.oaGray.1}' },
    },
    solid: {
      value: { _light: '{colors.oaGray.1}', _dark: '{colors.oaGray.1}' },
    },
    focusRing: {
      value: { _light: '{colors.oaGray.1}', _dark: '{colors.oaGray.1}' },
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
          _light: '{colors.strapi.frenchBlue.600}',
          _dark: '{colors.strapi.frenchBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.frenchBlue.100}',
          _dark: '{colors.strapi.frenchBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.frenchBlue.200}',
          _dark: '{colors.strapi.frenchBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.frenchBlue.300}',
          _dark: '{colors.strapi.frenchBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.frenchBlue.500}',
          _dark: '{colors.strapi.frenchBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.frenchBlue.600}',
          _dark: '{colors.strapi.frenchBlue.600}',
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
          _light: '{colors.strapi.vanilla.600}',
          _dark: '{colors.strapi.vanilla.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.vanilla.100}',
          _dark: '{colors.strapi.vanilla.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.vanilla.200}',
          _dark: '{colors.strapi.vanilla.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.vanilla.300}',
          _dark: '{colors.strapi.vanilla.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.vanilla.500}',
          _dark: '{colors.strapi.vanilla.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.vanilla.600}',
          _dark: '{colors.strapi.vanilla.600}',
        },
      },
    },
    pictonBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.pictonBlue.600}',
          _dark: '{colors.strapi.pictonBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.pictonBlue.100}',
          _dark: '{colors.strapi.pictonBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.pictonBlue.200}',
          _dark: '{colors.strapi.pictonBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.pictonBlue.300}',
          _dark: '{colors.strapi.pictonBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.pictonBlue.500}',
          _dark: '{colors.strapi.pictonBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.pictonBlue.600}',
          _dark: '{colors.strapi.pictonBlue.600}',
        },
      },
    },
    azure: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.azure.800}',
          _dark: '{colors.strapi.azure.100}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.azure.900}',
          _dark: '{colors.strapi.azure.100}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.azure.200}',
          _dark: '{colors.strapi.azure.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.azure.300}',
          _dark: '{colors.strapi.azure.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.azure.500}',
          _dark: '{colors.strapi.azure.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.azure.600}',
          _dark: '{colors.strapi.azure.600}',
        },
      },
    },
    lightSkyBlue: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.lightSkyBlue.600}',
          _dark: '{colors.strapi.lightSkyBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.lightSkyBlue.100}',
          _dark: '{colors.strapi.lightSkyBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.lightSkyBlue.200}',
          _dark: '{colors.strapi.lightSkyBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.lightSkyBlue.300}',
          _dark: '{colors.strapi.lightSkyBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.lightSkyBlue.500}',
          _dark: '{colors.strapi.lightSkyBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.lightSkyBlue.600}',
          _dark: '{colors.strapi.lightSkyBlue.600}',
        },
      },
    },
    marianBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.marianBlue.600}',
          _dark: '{colors.strapi.marianBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.marianBlue.100}',
          _dark: '{colors.strapi.marianBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.marianBlue.200}',
          _dark: '{colors.strapi.marianBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.marianBlue.300}',
          _dark: '{colors.strapi.marianBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.marianBlue.500}',
          _dark: '{colors.strapi.marianBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.marianBlue.600}',
          _dark: '{colors.strapi.marianBlue.600}',
        },
      },
    },
    mayaBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.mayaBlue.600}',
          _dark: '{colors.strapi.mayaBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.mayaBlue.100}',
          _dark: '{colors.strapi.mayaBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.mayaBlue.200}',
          _dark: '{colors.strapi.mayaBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.mayaBlue.300}',
          _dark: '{colors.strapi.mayaBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.mayaBlue.500}',
          _dark: '{colors.strapi.mayaBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.mayaBlue.600}',
          _dark: '{colors.strapi.mayaBlue.600}',
        },
      },
    },
    bleuDeFrance: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.bleuDeFrance.600}',
          _dark: '{colors.strapi.bleuDeFrance.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.bleuDeFrance.100}',
          _dark: '{colors.strapi.bleuDeFrance.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.bleuDeFrance.200}',
          _dark: '{colors.strapi.bleuDeFrance.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.bleuDeFrance.300}',
          _dark: '{colors.strapi.bleuDeFrance.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.bleuDeFrance.500}',
          _dark: '{colors.strapi.bleuDeFrance.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.bleuDeFrance.600}',
          _dark: '{colors.strapi.bleuDeFrance.600}',
        },
      },
    },
    mediumSlateBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.mediumSlateBlue.600}',
          _dark: '{colors.strapi.mediumSlateBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.mediumSlateBlue.100}',
          _dark: '{colors.strapi.mediumSlateBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.mediumSlateBlue.200}',
          _dark: '{colors.strapi.mediumSlateBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.mediumSlateBlue.300}',
          _dark: '{colors.strapi.mediumSlateBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.mediumSlateBlue.500}',
          _dark: '{colors.strapi.mediumSlateBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.mediumSlateBlue.600}',
          _dark: '{colors.strapi.mediumSlateBlue.600}',
        },
      },
    },
    razzmatazz: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.razzmatazz.600}',
          _dark: '{colors.strapi.razzmatazz.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.razzmatazz.100}',
          _dark: '{colors.strapi.razzmatazz.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.razzmatazz.200}',
          _dark: '{colors.strapi.razzmatazz.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.razzmatazz.300}',
          _dark: '{colors.strapi.razzmatazz.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.razzmatazz.500}',
          _dark: '{colors.strapi.razzmatazz.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.razzmatazz.600}',
          _dark: '{colors.strapi.razzmatazz.600}',
        },
      },
    },
    carribeanCurrent: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.carribeanCurrent.600}',
          _dark: '{colors.strapi.carribeanCurrent.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.carribeanCurrent.100}',
          _dark: '{colors.strapi.carribeanCurrent.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.carribeanCurrent.200}',
          _dark: '{colors.strapi.carribeanCurrent.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.carribeanCurrent.300}',
          _dark: '{colors.strapi.carribeanCurrent.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.carribeanCurrent.500}',
          _dark: '{colors.strapi.carribeanCurrent.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.carribeanCurrent.600}',
          _dark: '{colors.strapi.carribeanCurrent.600}',
        },
      },
    },
    persianGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.persianGreen.600}',
          _dark: '{colors.strapi.persianGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.persianGreen.100}',
          _dark: '{colors.strapi.persianGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.persianGreen.200}',
          _dark: '{colors.strapi.persianGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.persianGreen.300}',
          _dark: '{colors.strapi.persianGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.persianGreen.500}',
          _dark: '{colors.strapi.persianGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.persianGreen.600}',
          _dark: '{colors.strapi.persianGreen.600}',
        },
      },
    },
    ashGray: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.ashGray.600}',
          _dark: '{colors.strapi.ashGray.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.ashGray.100}',
          _dark: '{colors.strapi.ashGray.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.ashGray.200}',
          _dark: '{colors.strapi.ashGray.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.ashGray.300}',
          _dark: '{colors.strapi.ashGray.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.ashGray.500}',
          _dark: '{colors.strapi.ashGray.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.ashGray.600}',
          _dark: '{colors.strapi.ashGray.600}',
        },
      },
    },
    burntOrange: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.burntOrange.600}',
          _dark: '{colors.strapi.burntOrange.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.burntOrange.100}',
          _dark: '{colors.strapi.burntOrange.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.burntOrange.200}',
          _dark: '{colors.strapi.burntOrange.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.burntOrange.300}',
          _dark: '{colors.strapi.burntOrange.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.burntOrange.500}',
          _dark: '{colors.strapi.burntOrange.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.burntOrange.600}',
          _dark: '{colors.strapi.burntOrange.600}',
        },
      },
    },
    darkCyan: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.darkCyan.600}',
          _dark: '{colors.strapi.darkCyan.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.darkCyan.100}',
          _dark: '{colors.strapi.darkCyan.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.darkCyan.200}',
          _dark: '{colors.strapi.darkCyan.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.darkCyan.300}',
          _dark: '{colors.strapi.darkCyan.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.darkCyan.500}',
          _dark: '{colors.strapi.darkCyan.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.darkCyan.600}',
          _dark: '{colors.strapi.darkCyan.600}',
        },
      },
    },
    aquamarine: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.aquamarine.600}',
          _dark: '{colors.strapi.aquamarine.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.aquamarine.100}',
          _dark: '{colors.strapi.aquamarine.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.aquamarine.200}',
          _dark: '{colors.strapi.aquamarine.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.aquamarine.300}',
          _dark: '{colors.strapi.aquamarine.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.aquamarine.500}',
          _dark: '{colors.strapi.aquamarine.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.aquamarine.600}',
          _dark: '{colors.strapi.aquamarine.600}',
        },
      },
    },
    mint: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.mint.600}',
          _dark: '{colors.strapi.mint.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.mint.100}',
          _dark: '{colors.strapi.mint.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.mint.200}',
          _dark: '{colors.strapi.mint.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.mint.300}',
          _dark: '{colors.strapi.mint.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.mint.500}',
          _dark: '{colors.strapi.mint.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.mint.600}',
          _dark: '{colors.strapi.mint.600}',
        },
      },
    },
    skipSeaGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.skipSeaGreen.600}',
          _dark: '{colors.strapi.skipSeaGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.skipSeaGreen.100}',
          _dark: '{colors.strapi.skipSeaGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.skipSeaGreen.200}',
          _dark: '{colors.strapi.skipSeaGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.skipSeaGreen.300}',
          _dark: '{colors.strapi.skipSeaGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.skipSeaGreen.500}',
          _dark: '{colors.strapi.skipSeaGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.skipSeaGreen.600}',
          _dark: '{colors.strapi.skipSeaGreen.600}',
        },
      },
    },
    naturalAliceBlue: {
      contrast: {
        value: { _light: 'black', _dark: 'black' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.naturalAliceBlue.600}',
          _dark: '{colors.strapi.naturalAliceBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.naturalAliceBlue.100}',
          _dark: '{colors.strapi.naturalAliceBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.naturalAliceBlue.200}',
          _dark: '{colors.strapi.naturalAliceBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.naturalAliceBlue.300}',
          _dark: '{colors.strapi.naturalAliceBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.naturalAliceBlue.500}',
          _dark: '{colors.strapi.naturalAliceBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.naturalAliceBlue.600}',
          _dark: '{colors.strapi.naturalAliceBlue.600}',
        },
      },
    },
    ruddyBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.ruddyBlue.600}',
          _dark: '{colors.strapi.ruddyBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.ruddyBlue.100}',
          _dark: '{colors.strapi.ruddyBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.ruddyBlue.200}',
          _dark: '{colors.strapi.ruddyBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.ruddyBlue.300}',
          _dark: '{colors.strapi.ruddyBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.ruddyBlue.500}',
          _dark: '{colors.strapi.ruddyBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.ruddyBlue.600}',
          _dark: '{colors.strapi.ruddyBlue.600}',
        },
      },
    },
    sepia: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.sepia.600}',
          _dark: '{colors.strapi.sepia.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.sepia.100}',
          _dark: '{colors.strapi.sepia.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.sepia.200}',
          _dark: '{colors.strapi.sepia.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.sepia.300}',
          _dark: '{colors.strapi.sepia.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.sepia.500}',
          _dark: '{colors.strapi.sepia.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.sepia.600}',
          _dark: '{colors.strapi.sepia.600}',
        },
      },
    },
    goldenBrown: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.goldenBrown.600}',
          _dark: '{colors.strapi.goldenBrown.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.goldenBrown.100}',
          _dark: '{colors.strapi.goldenBrown.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.goldenBrown.200}',
          _dark: '{colors.strapi.goldenBrown.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.goldenBrown.300}',
          _dark: '{colors.strapi.goldenBrown.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.goldenBrown.500}',
          _dark: '{colors.strapi.goldenBrown.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.goldenBrown.600}',
          _dark: '{colors.strapi.goldenBrown.600}',
        },
      },
    },
    satinSheetGold: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.satinSheetGold.600}',
          _dark: '{colors.strapi.satinSheetGold.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.satinSheetGold.100}',
          _dark: '{colors.strapi.satinSheetGold.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.satinSheetGold.200}',
          _dark: '{colors.strapi.satinSheetGold.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.satinSheetGold.300}',
          _dark: '{colors.strapi.satinSheetGold.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.satinSheetGold.500}',
          _dark: '{colors.strapi.satinSheetGold.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.satinSheetGold.600}',
          _dark: '{colors.strapi.satinSheetGold.600}',
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
    pigmentGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.pigmentGreen.600}',
          _dark: '{colors.strapi.pigmentGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.pigmentGreen.100}',
          _dark: '{colors.strapi.pigmentGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.pigmentGreen.200}',
          _dark: '{colors.strapi.pigmentGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.pigmentGreen.300}',
          _dark: '{colors.strapi.pigmentGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.pigmentGreen.500}',
          _dark: '{colors.strapi.pigmentGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.pigmentGreen.600}',
          _dark: '{colors.strapi.pigmentGreen.600}',
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
          _light: '{colors.strapi.spotVistaBlue.600}',
          _dark: '{colors.strapi.spotVistaBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.spotVistaBlue.100}',
          _dark: '{colors.strapi.spotVistaBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.spotVistaBlue.200}',
          _dark: '{colors.strapi.spotVistaBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.spotVistaBlue.300}',
          _dark: '{colors.strapi.spotVistaBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.spotVistaBlue.500}',
          _dark: '{colors.strapi.spotVistaBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.spotVistaBlue.600}',
          _dark: '{colors.strapi.spotVistaBlue.600}',
        },
      },
    },
    spotAliceBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.spotAliceBlue.600}',
          _dark: '{colors.strapi.spotAliceBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.spotAliceBlue.100}',
          _dark: '{colors.strapi.spotAliceBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.spotAliceBlue.200}',
          _dark: '{colors.strapi.spotAliceBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.spotAliceBlue.300}',
          _dark: '{colors.strapi.spotAliceBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.spotAliceBlue.800}',
          _dark: '{colors.strapi.spotAliceBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.spotAliceBlue.600}',
          _dark: '{colors.strapi.spotAliceBlue.600}',
        },
      },
    },
    goldenRod: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.goldenRod.600}',
          _dark: '{colors.strapi.goldenRod.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.goldenRod.100}',
          _dark: '{colors.strapi.goldenRod.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.goldenRod.200}',
          _dark: '{colors.strapi.goldenRod.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.goldenRod.300}',
          _dark: '{colors.strapi.goldenRod.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.goldenRod.500}',
          _dark: '{colors.strapi.goldenRod.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.goldenRod.600}',
          _dark: '{colors.strapi.goldenRod.600}',
        },
      },
    },
    papayaWhip: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.papayaWhip.600}',
          _dark: '{colors.strapi.papayaWhip.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.papayaWhip.100}',
          _dark: '{colors.strapi.papayaWhip.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.papayaWhip.200}',
          _dark: '{colors.strapi.papayaWhip.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.papayaWhip.300}',
          _dark: '{colors.strapi.papayaWhip.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.papayaWhip.500}',
          _dark: '{colors.strapi.papayaWhip.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.papayaWhip.600}',
          _dark: '{colors.strapi.papayaWhip.600}',
        },
      },
    },
    coyote: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.coyote.600}',
          _dark: '{colors.strapi.coyote.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.coyote.100}',
          _dark: '{colors.strapi.coyote.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.coyote.200}',
          _dark: '{colors.strapi.coyote.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.coyote.300}',
          _dark: '{colors.strapi.coyote.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.coyote.500}',
          _dark: '{colors.strapi.coyote.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.coyote.600}',
          _dark: '{colors.strapi.coyote.600}',
        },
      },
    },
    cadetGray: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.cadetGray.600}',
          _dark: '{colors.strapi.cadetGray.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.cadetGray.100}',
          _dark: '{colors.strapi.cadetGray.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.cadetGray.200}',
          _dark: '{colors.strapi.cadetGray.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.cadetGray.300}',
          _dark: '{colors.strapi.cadetGray.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.cadetGray.500}',
          _dark: '{colors.strapi.cadetGray.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.cadetGray.600}',
          _dark: '{colors.strapi.cadetGray.600}',
        },
      },
    },
    fuchsiaRose: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.fuchsiaRose.600}',
          _dark: '{colors.strapi.fuchsiaRose.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.fuchsiaRose.100}',
          _dark: '{colors.strapi.fuchsiaRose.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.fuchsiaRose.200}',
          _dark: '{colors.strapi.fuchsiaRose.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.fuchsiaRose.300}',
          _dark: '{colors.strapi.fuchsiaRose.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.fuchsiaRose.500}',
          _dark: '{colors.strapi.fuchsiaRose.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.fuchsiaRose.600}',
          _dark: '{colors.strapi.fuchsiaRose.600}',
        },
      },
    },
    tickleMePink: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.tickleMePink.600}',
          _dark: '{colors.strapi.tickleMePink.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.tickleMePink.100}',
          _dark: '{colors.strapi.tickleMePink.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.tickleMePink.200}',
          _dark: '{colors.strapi.tickleMePink.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.tickleMePink.300}',
          _dark: '{colors.strapi.tickleMePink.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.tickleMePink.500}',
          _dark: '{colors.strapi.tickleMePink.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.tickleMePink.600}',
          _dark: '{colors.strapi.tickleMePink.600}',
        },
      },
    },
    myrtleGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.myrtleGreen.600}',
          _dark: '{colors.strapi.myrtleGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.myrtleGreen.100}',
          _dark: '{colors.strapi.myrtleGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.myrtleGreen.200}',
          _dark: '{colors.strapi.myrtleGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.myrtleGreen.300}',
          _dark: '{colors.strapi.myrtleGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.myrtleGreen.500}',
          _dark: '{colors.strapi.myrtleGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.myrtleGreen.600}',
          _dark: '{colors.strapi.myrtleGreen.600}',
        },
      },
    },
    chiliRed: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.chiliRed.600}',
          _dark: '{colors.strapi.chiliRed.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.chiliRed.100}',
          _dark: '{colors.strapi.chiliRed.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.chiliRed.200}',
          _dark: '{colors.strapi.chiliRed.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.chiliRed.300}',
          _dark: '{colors.strapi.chiliRed.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.chiliRed.500}',
          _dark: '{colors.strapi.chiliRed.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.chiliRed.600}',
          _dark: '{colors.strapi.chiliRed.600}',
        },
      },
    },
    seaGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.seaGreen.600}',
          _dark: '{colors.strapi.seaGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.seaGreen.100}',
          _dark: '{colors.strapi.seaGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.seaGreen.200}',
          _dark: '{colors.strapi.seaGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.seaGreen.300}',
          _dark: '{colors.strapi.seaGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.seaGreen.500}',
          _dark: '{colors.strapi.seaGreen.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.seaGreen.600}',
          _dark: '{colors.strapi.seaGreen.600}',
        },
      },
    },
    vistaBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.vistaBlue.600}',
          _dark: '{colors.strapi.vistaBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.vistaBlue.100}',
          _dark: '{colors.strapi.vistaBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.vistaBlue.200}',
          _dark: '{colors.strapi.vistaBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.vistaBlue.300}',
          _dark: '{colors.strapi.vistaBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.vistaBlue.500}',
          _dark: '{colors.strapi.vistaBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.vistaBlue.600}',
          _dark: '{colors.strapi.vistaBlue.600}',
        },
      },
    },
    discreetAliceBlue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.discreetAliceBlue.600}',
          _dark: '{colors.strapi.discreetAliceBlue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.discreetAliceBlue.100}',
          _dark: '{colors.strapi.discreetAliceBlue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.discreetAliceBlue.200}',
          _dark: '{colors.strapi.discreetAliceBlue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.discreetAliceBlue.300}',
          _dark: '{colors.strapi.discreetAliceBlue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.discreetAliceBlue.800}',
          _dark: '{colors.strapi.discreetAliceBlue.500}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.discreetAliceBlue.600}',
          _dark: '{colors.strapi.discreetAliceBlue.600}',
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
