import { defineSemanticTokens } from '@chakra-ui/react';

// Where a checkbox's or a radio's label starts, past its control and the gap
// (by the control's size, as the checkbox and radio recipes draw them): the
// hint under the label and what depends on the control line up there
export const semanticSpacing = defineSemanticTokens.spacing({
  controlLabel: {
    xs: { value: 'calc({spacing.2} + {spacing.1.5})' },
    sm: { value: 'calc({spacing.3} + {spacing.2})' },
    md: { value: 'calc({spacing.4} + {spacing.2.5})' },
    lg: { value: 'calc({spacing.5} + {spacing.3})' },
  },
});
