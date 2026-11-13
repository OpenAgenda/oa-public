import {
  RadioGroup as ChakraRadioGroup,
  chakra,
  useRadioGroupContext,
  useRadioGroupStyles,
} from '@chakra-ui/react';
import * as React from 'react';
import { splitLayoutProps } from './layoutProps';

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
    const group = useRadioGroupContext();
    // With a description, the layout props go to the block around both
    const [layoutProps, itemProps] = description == null ? [{}, rest] : splitLayoutProps(rest);
    const describedBy = [
      inputProps?.['aria-describedby'],
      description == null ? null : descriptionId,
    ]
      .filter(Boolean)
      .join(' ');

    const radio = (
      <ChakraRadioGroup.Item ref={rootRef} {...itemProps}>
        <ChakraRadioGroup.ItemHiddenInput
          ref={ref}
          {...inputProps}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
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
      <chakra.div
        display="flex"
        flexDirection="column"
        gap="0.5"
        {...layoutProps}
      >
        {radio}
        <chakra.div
          id={descriptionId}
          css={styles.itemDescription}
          // Dimmed with the radio, disabled by itself, its group or its
          // fieldset
          data-disabled={
            group.getItemState({ value: rest.value }).disabled || undefined
          }
        >
          {description}
        </chakra.div>
      </chakra.div>
    );
  },
);

export const RadioGroup = ChakraRadioGroup.Root;
