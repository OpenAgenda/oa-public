import { useRef } from 'react';
import { Box, ThemeTypings, HTMLChakraProps } from '@openagenda/uikit';

interface CollapseProps extends HTMLChakraProps<'div'> {
  children: React.ReactNode;
  in?: boolean;
  breakpoint?: ThemeTypings['breakpoints'] | string;
  transition?: string
}

const defaultTransition = 'max-height .3s, opacity .4s';

export default function Collapse({
  children,
  in: isOpen = false,
  breakpoint = 'lg',
  transition: transitionProp = defaultTransition,
  ...rest
}: CollapseProps) {
  const ref = useRef(null);

  const scrollHeight = ref.current?.scrollHeight || 0;

  // allow to extend transition
  const transition = transitionProp.replace('...', defaultTransition);

  return (
    <Box
      ref={ref}
      maxHeight={{
        base: isOpen ? `${scrollHeight}px` : 0,
        [breakpoint]: 'none',
      }}
      opacity={{
        base: isOpen ? 1 : 0,
        [breakpoint]: 1,
      }}
      overflow="hidden"
      transition={transition}
      {...rest}
    >
      {children}
    </Box>
  );
}
