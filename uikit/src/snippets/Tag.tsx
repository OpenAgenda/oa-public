import { Tag as ChakraTag } from '@chakra-ui/react';
import * as React from 'react';

export interface TagProps extends ChakraTag.RootProps {
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  onClose?: VoidFunction;
  closable?: boolean;
  // The name of the close button, which shows a cross only: what it removes
  closeLabel?: string;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  function Tag(props, ref) {
    const {
      startElement,
      endElement,
      onClose,
      closable = !!onClose,
      closeLabel,
      children,
      ...rest
    } = props;

    return (
      <ChakraTag.Root ref={ref} {...rest}>
        {startElement && (
          <ChakraTag.StartElement>{startElement}</ChakraTag.StartElement>
        )}
        <ChakraTag.Label>{children}</ChakraTag.Label>
        {endElement && (
          <ChakraTag.EndElement>{endElement}</ChakraTag.EndElement>
        )}
        {closable && (
          <ChakraTag.EndElement>
            <ChakraTag.CloseTrigger aria-label={closeLabel} onClick={onClose} />
          </ChakraTag.EndElement>
        )}
      </ChakraTag.Root>
    );
  },
);
