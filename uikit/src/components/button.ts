import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

type AccessibleColor = {
  bg?: string;
  color?: string;
  hoverBg?: string;
  activeBg?: string;
  border?: string;
  borderColor?: string;
};

/** Accessible color overrides for less accessible colors. */
const accessibleColorMap: { [key: string]: AccessibleColor } = {
  oaGray: {
    bg: 'oaGray.50',
    color: 'black',
    hoverBg: 'oaGray.200',
    activeBg: 'oaGray.300',
    borderColor: 'oaGray.700',
  },
};

const variantSolid = defineStyle(props => {
  const { colorScheme: c } = props;

  const {
    bg = `${c}.500`,
    color = 'white',
    hoverBg = `${c}.600`,
    activeBg = `${c}.700`,
    borderColor = `${c}.600`,
  } = accessibleColorMap[c] ?? {};

  const background = mode(bg, `${c}.200`)(props);

  return {
    bg: background,
    color: mode(color, 'gray.800')(props),
    borderColor,
    _hover: {
      bg: mode(hoverBg, `${c}.300`)(props),
      _disabled: {
        bg: background,
      },
    },
    _active: { bg: mode(activeBg, `${c}.400`)(props) },
  };
});

const variantLink = defineStyle(props => {
  const { colorScheme: c } = props;

  return {
    border: '0',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    _hover: {
      color: `${c}.600`,
    },
  };
});

const variants = {
  // ghost: variantGhost,
  // outline: variantOutline,
  solid: variantSolid,
  link: variantLink,
  // unstyled: variantUnstyled,
};

const sizes = {
  lg: defineStyle({
    borderRadius: 'md',
  }),
  md: defineStyle({
    borderRadius: 'md',
  }),
  sm: defineStyle({
    borderRadius: 'base',
  }),
  xs: defineStyle({
    borderRadius: 'base',
  }),
};

export const buttonTheme = defineStyleConfig({
  baseStyle: defineStyle({
    fontWeight: 'normal',
    border: '1px',
  }),
  sizes,
  variants,
  defaultProps: {
    colorScheme: 'oaGray',
  },
});
