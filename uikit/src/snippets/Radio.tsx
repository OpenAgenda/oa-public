import {
  RadioGroup as ChakraRadioGroup,
  chakra,
  useRadioGroupStyles,
} from '@chakra-ui/react';
import * as React from 'react';

export interface RadioProps extends ChakraRadioGroup.ItemProps {
  rootRef?: React.Ref<HTMLDivElement>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  // A hint under the label: aligned with it, read as the radio's
  // description, dimmed with it when disabled
  description?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    const { children, inputProps, rootRef, description, ...rest } = props;
    const descriptionId = React.useId();
    const styles = useRadioGroupStyles();

    const radio = (
      <ChakraRadioGroup.Item ref={rootRef} {...rest}>
        <ChakraRadioGroup.ItemHiddenInput
          ref={ref}
          {...inputProps}
          aria-describedby={
            description
              ? [inputProps?.['aria-describedby'], descriptionId]
                .filter(Boolean)
                .join(' ')
              : inputProps?.['aria-describedby']
          }
        />
        <ChakraRadioGroup.ItemIndicator />
        {children && (
          <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>
        )}
      </ChakraRadioGroup.Item>
    );

    if (description == null) return radio;

    // Outside the item, a label element: inside, the hint would be part of
    // the radio's name
    return (
      <chakra.div display="flex" flexDirection="column" gap="0.5">
        {radio}
        <chakra.div
          id={descriptionId}
          css={styles.itemDescription}
          data-disabled={rest.disabled || undefined}
        >
          {description}
        </chakra.div>
      </chakra.div>
    );
  },
);

export const RadioGroup = ChakraRadioGroup.Root;
