import { ForwardedRef, forwardRef } from 'react';
import { Button } from '@openagenda/uikit';

const FloatingButton = forwardRef<HTMLElement, any>(function FloatingButton(
  props,
  ref: ForwardedRef<any>,
) {
  return (
    <Button
      ref={ref}
      variant="outline"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
      _expanded={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
      position="absolute"
      top="6"
      right="6"
      {...props}
    />
  );
});

export default FloatingButton;
