import { forwardRef } from 'react';
import { Button, ButtonProps } from '@openagenda/uikit';

const ContextBarButton = forwardRef<HTMLButtonElement, any>(
  function ContextBarButton({ children, ...buttonProps }: ButtonProps, ref) {
    return (
      <Button
        ref={ref}
        variant="ghost"
        w="full"
        h="full"
        justifyContent="space-between"
        borderRadius="none"
        color="white"
        whiteSpace="normal"
        _hover={{
          textDecoration: 'none',
          bgColor: 'oaBlue.600',
        }}
        _active={{
          bgColor: 'oaBlue.600',
        }}
        {...buttonProps}
        // __css={{
        //   w: 'full',
        //   h: 'full',
        //   justifyContent: 'space-between',
        //   borderRadius: 'none',
        //   color: 'white',
        //   whiteSpace: 'normal',
        // }}
      >
        {children}
      </Button>
    );
  },
);

export default ContextBarButton;
