import {
  Checkbox as ChakraCheckbox,
  chakra,
  useFieldContext,
  useSlotRecipe,
} from '@chakra-ui/react';
import * as React from 'react';
import { splitLayoutProps } from './layoutProps';

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
    const field = useFieldContext();
    const recipe = useSlotRecipe({ key: 'checkbox' });
    const [variantProps] = recipe.splitVariantProps(rest);
    const styles = recipe(variantProps);
    // With a description, the layout props go to the block around both
    const [layoutProps, rootProps] = description == null ? [{}, rest] : splitLayoutProps(rest);
    // Set only when there is one: an `aria-describedby` key, even undefined,
    // would replace the one a Field gives (its help and error texts)
    const describedBy = [
      inputProps?.['aria-describedby'],
      description == null ? null : descriptionId,
      description == null ? null : field?.ariaDescribedby,
    ]
      .filter(Boolean)
      .join(' ');

    const checkbox = (
      <ChakraCheckbox.Root ref={rootRef} {...rootProps}>
        <ChakraCheckbox.HiddenInput
          ref={ref}
          {...inputProps}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
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
      <chakra.div
        display="flex"
        flexDirection="column"
        gap="0.5"
        {...layoutProps}
      >
        {checkbox}
        <chakra.div
          id={descriptionId}
          css={styles.description}
          // Dimmed with the checkbox, disabled by itself or by its Field
          data-disabled={rest.disabled || field?.disabled || undefined}
        >
          {description}
        </chakra.div>
      </chakra.div>
    );
  },
);
