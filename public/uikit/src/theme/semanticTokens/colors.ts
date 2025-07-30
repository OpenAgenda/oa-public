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
    blueViolet: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.blueViolet.700}',
          _dark: '{colors.strapi.blueViolet.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.blueViolet.50}',
          _dark: '{colors.strapi.blueViolet.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.blueViolet.200}',
          _dark: '{colors.strapi.blueViolet.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.blueViolet.300}',
          _dark: '{colors.strapi.blueViolet.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.blueViolet.600}',
          _dark: '{colors.strapi.blueViolet.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.blueViolet.600}',
          _dark: '{colors.strapi.blueViolet.600}',
        },
      },
    },
    rosyRed: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.rosyRed.700}',
          _dark: '{colors.strapi.rosyRed.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.rosyRed.50}',
          _dark: '{colors.strapi.rosyRed.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.rosyRed.200}',
          _dark: '{colors.strapi.rosyRed.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.rosyRed.300}',
          _dark: '{colors.strapi.rosyRed.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.rosyRed.600}',
          _dark: '{colors.strapi.rosyRed.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.rosyRed.600}',
          _dark: '{colors.strapi.rosyRed.600}',
        },
      },
    },
    paleLavender: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.paleLavender.700}',
          _dark: '{colors.strapi.paleLavender.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.paleLavender.100}',
          _dark: '{colors.strapi.paleLavender.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.paleLavender.200}',
          _dark: '{colors.strapi.paleLavender.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.paleLavender.300}',
          _dark: '{colors.strapi.paleLavender.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.paleLavender.600}',
          _dark: '{colors.strapi.paleLavender.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.paleLavender.600}',
          _dark: '{colors.strapi.paleLavender.600}',
        },
      },
    },
    blueGreen: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.blueGreen.700}',
          _dark: '{colors.strapi.blueGreen.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.blueGreen.50}',
          _dark: '{colors.strapi.blueGreen.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.blueGreen.200}',
          _dark: '{colors.strapi.blueGreen.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.blueGreen.300}',
          _dark: '{colors.strapi.blueGreen.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.blueGreen.600}',
          _dark: '{colors.strapi.blueGreen.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.blueGreen.600}',
          _dark: '{colors.strapi.blueGreen.600}',
        },
      },
    },
    sandBeige: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.sandBeige.700}',
          _dark: '{colors.strapi.sandBeige.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.sandBeige.100}',
          _dark: '{colors.strapi.sandBeige.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.sandBeige.200}',
          _dark: '{colors.strapi.sandBeige.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.sandBeige.300}',
          _dark: '{colors.strapi.sandBeige.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.sandBeige.600}',
          _dark: '{colors.strapi.sandBeige.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.sandBeige.600}',
          _dark: '{colors.strapi.sandBeige.600}',
        },
      },
    },
    mutedPlum: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.strapi.mutedPlum.700}',
          _dark: '{colors.strapi.mutedPlum.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.strapi.mutedPlum.50}',
          _dark: '{colors.strapi.mutedPlum.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.strapi.mutedPlum.200}',
          _dark: '{colors.strapi.mutedPlum.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.strapi.mutedPlum.300}',
          _dark: '{colors.strapi.mutedPlum.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.strapi.mutedPlum.600}',
          _dark: '{colors.strapi.mutedPlum.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.strapi.mutedPlum.600}',
          _dark: '{colors.strapi.mutedPlum.600}',
        },
      },
    },
    flashy: {
      blueViolet: {
        contrast: {
          value: { _light: 'white', _dark: 'white' },
        },
        fg: {
          value: {
            _light: '{colors.strapi.flashy.blueViolet.700}',
            _dark: '{colors.strapi.flashy.blueViolet.300}',
          },
        },
        subtle: {
          value: {
            _light: '{colors.strapi.flashy.blueViolet.100}',
            _dark: '{colors.strapi.flashy.blueViolet.900}',
          },
        },
        muted: {
          value: {
            _light: '{colors.strapi.flashy.blueViolet.200}',
            _dark: '{colors.strapi.flashy.blueViolet.800}',
          },
        },
        emphasized: {
          value: {
            _light: '{colors.strapi.flashy.blueViolet.300}',
            _dark: '{colors.strapi.flashy.blueViolet.700}',
          },
        },
        solid: {
          value: {
            _light: '{colors.strapi.flashy.blueViolet.600}',
            _dark: '{colors.strapi.flashy.blueViolet.600}',
          },
        },
        focusRing: {
          value: {
            _light: '{colors.strapi.flashy.blueViolet.600}',
            _dark: '{colors.strapi.flashy.blueViolet.600}',
          },
        },
      },
      rosyRed: {
        contrast: {
          value: { _light: 'white', _dark: 'white' },
        },
        fg: {
          value: {
            _light: '{colors.strapi.flashy.rosyRed.700}',
            _dark: '{colors.strapi.flashy.rosyRed.300}',
          },
        },
        subtle: {
          value: {
            _light: '{colors.strapi.flashy.rosyRed.100}',
            _dark: '{colors.strapi.flashy.rosyRed.900}',
          },
        },
        muted: {
          value: {
            _light: '{colors.strapi.flashy.rosyRed.200}',
            _dark: '{colors.strapi.flashy.rosyRed.800}',
          },
        },
        emphasized: {
          value: {
            _light: '{colors.strapi.flashy.rosyRed.300}',
            _dark: '{colors.strapi.flashy.rosyRed.700}',
          },
        },
        solid: {
          value: {
            _light: '{colors.strapi.flashy.rosyRed.600}',
            _dark: '{colors.strapi.flashy.rosyRed.600}',
          },
        },
        focusRing: {
          value: {
            _light: '{colors.strapi.flashy.rosyRed.600}',
            _dark: '{colors.strapi.flashy.rosyRed.600}',
          },
        },
      },
      paleLavender: {
        contrast: {
          value: { _light: 'white', _dark: 'white' },
        },
        fg: {
          value: {
            _light: '{colors.strapi.flashy.paleLavender.700}',
            _dark: '{colors.strapi.flashy.paleLavender.300}',
          },
        },
        subtle: {
          value: {
            _light: '{colors.strapi.flashy.paleLavender.100}',
            _dark: '{colors.strapi.flashy.paleLavender.900}',
          },
        },
        muted: {
          value: {
            _light: '{colors.strapi.flashy.paleLavender.200}',
            _dark: '{colors.strapi.flashy.paleLavender.800}',
          },
        },
        emphasized: {
          value: {
            _light: '{colors.strapi.flashy.paleLavender.300}',
            _dark: '{colors.strapi.flashy.paleLavender.700}',
          },
        },
        solid: {
          value: {
            _light: '{colors.strapi.flashy.paleLavender.600}',
            _dark: '{colors.strapi.flashy.paleLavender.600}',
          },
        },
        focusRing: {
          value: {
            _light: '{colors.strapi.flashy.paleLavender.600}',
            _dark: '{colors.strapi.flashy.paleLavender.600}',
          },
        },
      },
      blueGreen: {
        contrast: {
          value: { _light: 'white', _dark: 'white' },
        },
        fg: {
          value: {
            _light: '{colors.strapi.flashy.blueGreen.700}',
            _dark: '{colors.strapi.flashy.blueGreen.300}',
          },
        },
        subtle: {
          value: {
            _light: '{colors.strapi.flashy.blueGreen.100}',
            _dark: '{colors.strapi.flashy.blueGreen.900}',
          },
        },
        muted: {
          value: {
            _light: '{colors.strapi.flashy.blueGreen.200}',
            _dark: '{colors.strapi.flashy.blueGreen.800}',
          },
        },
        emphasized: {
          value: {
            _light: '{colors.strapi.flashy.blueGreen.300}',
            _dark: '{colors.strapi.flashy.blueGreen.700}',
          },
        },
        solid: {
          value: {
            _light: '{colors.strapi.flashy.blueGreen.600}',
            _dark: '{colors.strapi.flashy.blueGreen.600}',
          },
        },
        focusRing: {
          value: {
            _light: '{colors.strapi.flashy.blueGreen.600}',
            _dark: '{colors.strapi.flashy.blueGreen.600}',
          },
        },
      },
      sandBeige: {
        contrast: {
          value: { _light: 'white', _dark: 'white' },
        },
        fg: {
          value: {
            _light: '{colors.strapi.flashy.sandBeige.700}',
            _dark: '{colors.strapi.flashy.sandBeige.300}',
          },
        },
        subtle: {
          value: {
            _light: '{colors.strapi.flashy.sandBeige.100}',
            _dark: '{colors.strapi.flashy.sandBeige.900}',
          },
        },
        muted: {
          value: {
            _light: '{colors.strapi.flashy.sandBeige.200}',
            _dark: '{colors.strapi.flashy.sandBeige.800}',
          },
        },
        emphasized: {
          value: {
            _light: '{colors.strapi.flashy.sandBeige.300}',
            _dark: '{colors.strapi.flashy.sandBeige.700}',
          },
        },
        solid: {
          value: {
            _light: '{colors.strapi.flashy.sandBeige.600}',
            _dark: '{colors.strapi.flashy.sandBeige.600}',
          },
        },
        focusRing: {
          value: {
            _light: '{colors.strapi.flashy.sandBeige.600}',
            _dark: '{colors.strapi.flashy.sandBeige.600}',
          },
        },
      },
      mutedPlum: {
        contrast: {
          value: { _light: 'white', _dark: 'white' },
        },
        fg: {
          value: {
            _light: '{colors.strapi.flashy.mutedPlum.700}',
            _dark: '{colors.strapi.flashy.mutedPlum.300}',
          },
        },
        subtle: {
          value: {
            _light: '{colors.strapi.flashy.mutedPlum.100}',
            _dark: '{colors.strapi.flashy.mutedPlum.900}',
          },
        },
        muted: {
          value: {
            _light: '{colors.strapi.flashy.mutedPlum.200}',
            _dark: '{colors.strapi.flashy.mutedPlum.800}',
          },
        },
        emphasized: {
          value: {
            _light: '{colors.strapi.flashy.mutedPlum.300}',
            _dark: '{colors.strapi.flashy.mutedPlum.700}',
          },
        },
        solid: {
          value: {
            _light: '{colors.strapi.flashy.mutedPlum.600}',
            _dark: '{colors.strapi.flashy.mutedPlum.600}',
          },
        },
        focusRing: {
          value: {
            _light: '{colors.strapi.flashy.mutedPlum.600}',
            _dark: '{colors.strapi.flashy.mutedPlum.600}',
          },
        },
      },
    },
  },
});
