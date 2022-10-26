import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

type AccessibleColor = {
  bg?: string;
  color?: string;
  hover?: string;
  hoverBg?: string;
  activeBg?: string;
  borderColor?: string;
};

const solidColorMap: { [key: string]: AccessibleColor } = {
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
  } = solidColorMap[c] ?? {};

  const background = mode(bg, `${c}.200`)(props);

  return {
    border: '1px',
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

const linkColorMap: { [key: string]: AccessibleColor } = {
  oaGray: {
    color: 'oaGray.600',
    hover: 'oaGray.900',
  },
};

const variantLink = defineStyle(props => {
  const { colorScheme: c } = props;

  const {
    color = mode(`${c}.500`, `${c}.200`)(props),
    hover = mode(`${c}.600`, `${c}.300`)(props),
  } = linkColorMap[c] ?? {};

  return {
    color,
    fontSize: 'inherit',
    fontWeight: 'inherit',
    _hover: {
      color: hover,
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
  }),
  sizes,
  variants,
  defaultProps: {
    colorScheme: 'oaGray',
  },
});
