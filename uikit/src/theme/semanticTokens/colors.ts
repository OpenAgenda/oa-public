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

  institTheme: {
    blue: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.institTheme.blue.700}',
          _dark: '{colors.institTheme.blue.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.institTheme.blue.100}',
          _dark: '{colors.institTheme.blue.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.institTheme.blue.200}',
          _dark: '{colors.institTheme.blue.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.institTheme.blue.300}',
          _dark: '{colors.institTheme.blue.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.institTheme.blue.600}',
          _dark: '{colors.institTheme.blue.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.institTheme.blue.600}',
          _dark: '{colors.institTheme.blue.600}',
        },
      },
    },
    purple: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.institTheme.purple.700}',
          _dark: '{colors.institTheme.purple.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.institTheme.purple.100}',
          _dark: '{colors.institTheme.purple.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.institTheme.purple.200}',
          _dark: '{colors.institTheme.purple.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.institTheme.purple.300}',
          _dark: '{colors.institTheme.purple.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.institTheme.purple.600}',
          _dark: '{colors.institTheme.purple.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.institTheme.purple.600}',
          _dark: '{colors.institTheme.purple.600}',
        },
      },
    },
    darkPink: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.institTheme.darkPink.700}',
          _dark: '{colors.institTheme.darkPink.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.institTheme.darkPink.100}',
          _dark: '{colors.institTheme.darkPink.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.institTheme.darkPink.200}',
          _dark: '{colors.institTheme.darkPink.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.institTheme.darkPink.300}',
          _dark: '{colors.institTheme.darkPink.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.institTheme.darkPink.600}',
          _dark: '{colors.institTheme.darkPink.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.institTheme.darkPink.600}',
          _dark: '{colors.institTheme.darkPink.600}',
        },
      },
    },
    blueGrey: {
      contrast: {
        value: { _light: 'white', _dark: 'white' },
      },
      fg: {
        value: {
          _light: '{colors.institTheme.blueGrey.700}',
          _dark: '{colors.institTheme.blueGrey.300}',
        },
      },
      subtle: {
        value: {
          _light: '{colors.institTheme.blueGrey.100}',
          _dark: '{colors.institTheme.blueGrey.900}',
        },
      },
      muted: {
        value: {
          _light: '{colors.institTheme.blueGrey.200}',
          _dark: '{colors.institTheme.blueGrey.800}',
        },
      },
      emphasized: {
        value: {
          _light: '{colors.institTheme.blueGrey.300}',
          _dark: '{colors.institTheme.blueGrey.700}',
        },
      },
      solid: {
        value: {
          _light: '{colors.institTheme.blueGrey.600}',
          _dark: '{colors.institTheme.blueGrey.600}',
        },
      },
      focusRing: {
        value: {
          _light: '{colors.institTheme.blueGrey.600}',
          _dark: '{colors.institTheme.blueGrey.600}',
        },
      },
    },
  },
});
