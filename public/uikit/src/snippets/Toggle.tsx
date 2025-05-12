'use client';

import type { ButtonProps } from '@chakra-ui/react';
import {
  Button,
  Toggle as ChakraToggle,
  useToggleContext,
} from '@chakra-ui/react';
import * as React from 'react';

const variantMap = {
  solid: { on: 'solid', off: 'outline' },
  surface: { on: 'surface', off: 'outline' },
  subtle: { on: 'subtle', off: 'ghost' },
  ghost: { on: 'subtle', off: 'ghost' },
} as const;

interface ToggleBaseButtonProps extends Omit<ButtonProps, 'variant'> {
  variant: Record<'on' | 'off', ButtonProps['variant']>;
}

const ToggleBaseButton = React.forwardRef<
  HTMLButtonElement,
  ToggleBaseButtonProps
>(function ToggleBaseButton(props, ref) {
  const toggle = useToggleContext();
  const { variant, ...rest } = props;
  return (
    <Button
      variant={toggle.pressed ? variant.on : variant.off}
      ref={ref}
      {...rest}
    />
  );
});

interface ToggleProps extends ChakraToggle.RootProps {
  variant?: keyof typeof variantMap;
  size?: ButtonProps['size'];
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(props, ref) {
    const { variant = 'subtle', size, children, ...rest } = props;
    const variantConfig = variantMap[variant];

    return (
      <ChakraToggle.Root asChild {...rest}>
        <ToggleBaseButton size={size} variant={variantConfig} ref={ref}>
          {children}
        </ToggleBaseButton>
      </ChakraToggle.Root>
    );
  },
);

export const ToggleIndicator = ChakraToggle.Indicator;
