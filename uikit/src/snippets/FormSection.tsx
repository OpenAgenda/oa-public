import { Fieldset } from '@chakra-ui/react';
import * as React from 'react';
import { Surface, type SurfaceProps } from '../components/Surface';

export interface FormSectionProps extends Omit<SurfaceProps, 'title'> {
  // The section's title, its fieldset's legend; without one, a plain block
  title?: React.ReactNode;
}

// One part of a long form, in its own block on the page background: a
// surface with the form's padding, its fields grouped under the title
export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  function FormSection(props, ref) {
    const { title, children, ...rest } = props;
    return (
      <Surface ref={ref} px="6" pt="5" pb="6" {...rest}>
        {title != null ? (
          <Fieldset.Root>
            <Fieldset.Legend fontWeight="semibold" mb="2">
              {title}
            </Fieldset.Legend>
            {children}
          </Fieldset.Root>
        )
          : children}
      </Surface>
    );
  },
);
