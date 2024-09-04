import { Button, ButtonProps, forwardRef } from '@openagenda/uikit';

const ContextBarButton = forwardRef<ButtonProps, 'button'>(
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
          bgColor: 'primary.600',
        }}
        _active={{
          bgColor: 'primary.600',
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
