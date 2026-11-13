import {
  Checkbox as ChakraCheckbox,
  chakra,
  useSlotRecipe,
} from '@chakra-ui/react';
import * as React from 'react';

export interface CheckboxProps extends ChakraCheckbox.RootProps {
  icon?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
  // A hint under the label: aligned with it, read as the checkbox's
  // description, dimmed with it when disabled
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const { icon, children, inputProps, rootRef, description, ...rest } = props;
    const descriptionId = React.useId();
    const recipe = useSlotRecipe({ key: 'checkbox' });
    const [variantProps] = recipe.splitVariantProps(rest);
    const styles = recipe(variantProps);

    const checkbox = (
      <ChakraCheckbox.Root ref={rootRef} {...rest}>
        <ChakraCheckbox.HiddenInput
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
        <ChakraCheckbox.Control>
          {icon || <ChakraCheckbox.Indicator />}
        </ChakraCheckbox.Control>
        {children != null && (
          <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>
        )}
      </ChakraCheckbox.Root>
    );

    if (description == null) return checkbox;

    // Outside the root, a label element: inside, the hint would be part of
    // the checkbox's name
    return (
      <chakra.div display="flex" flexDirection="column" gap="0.5">
        {checkbox}
        <chakra.div
          id={descriptionId}
          css={styles.description}
          data-disabled={rest.disabled || undefined}
        >
          {description}
        </chakra.div>
      </chakra.div>
    );
  },
);
