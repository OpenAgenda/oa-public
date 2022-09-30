import { extendTheme } from '@chakra-ui/react';
import type { StyleFunctionProps } from '@chakra-ui/styled-system';

const brandColor = {
  50: '#eef7fc',
  100: '#cbe8f6',
  200: '#a8d9f0',
  300: '#86caea',
  400: '#63bbe3',
  500: '#41acdd', // https://coolors.co/30343f-fafaff-e4d9ff-41acdd-1e2749
  600: '#259ad0',
  700: '#1f80ad',
  800: '#18678b',
  900: '#030d11'
};

export default extendTheme({
  styles: {
    global: () => ({
      html: {
        backgroundColor: 'gray.100'
      },
      body: {
        backgroundColor: 'transparent',
        fontFamily: 'helvetica'
      },
    }),
  },
  sizes: {
    4: '0.5rem',
    5: '0.75rem',
    6: '1rem',
    7: '1.25rem',
    8: '1.5rem',
    9: '1.75rem',
    10: '2rem',
    12: '2.5rem',
    14: '3rem',
    16: '4rem',
    20: '5rem',
    28: '6rem',
    32: '7rem',
    36: '8rem',
    40: '9rem',
    44: '10rem',
    48: '11rem',
    52: '12rem'
  },
  fontSizes: {
    xs: '0.6rem',
    sm: '0.75rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    '4xl': '1.875rem',
    '5xl': '2.25rem',
    '6xl': '3rem',
    '7xl': '3.75rem',
    '8xl': '4.5rem',
    '9xl': '6rem',
    '10xl': '8rem',
  },
  colors: {
    brand: brandColor,
    primary: brandColor,
    gray: {
      50: '#efefef',
      100: '#eee',
      700: '#333'
    }
  },
  components: {
    Button: {
      baseStyle: (props: StyleFunctionProps) => ({
        fontSize: 'inherit',
        fontWeight: 'normal',
        border: '1px',
        borderColor: props.colorScheme === 'primary' ? 'brand.500' : 'gray.700',
        borderRadius: '4',
        backgroundColor: 'gray.50'
      }),
      variants: {
        solid: (props: StyleFunctionProps) => ({
          color: props.colorScheme === 'primary' ? 'white' : 'gray.700'
        }),
        link: {
          color: 'brand.500',
          border: '0',
          backgroundColor: 'transparent'
        }
      }
    }
  }
});
