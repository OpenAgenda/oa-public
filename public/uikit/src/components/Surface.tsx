'use client';

import {
  createRecipeContext,
  type HTMLChakraProps,
  type RecipeProps,
  type UnstyledProp,
} from '@chakra-ui/react';

// Mirrors how Chakra builds its own single-part recipe components (Badge, Code,
// …): bind the registered `surface` recipe by key via createRecipeContext, so
// the component reads it from the theme system rather than embedding a recipe
// config. See theme/recipes/surface.ts for the styles (flat: bg + radius, no
// border/shadow); callers pass their own layout and may use `asChild`.
const { withContext } = createRecipeContext({ key: 'surface' });

export interface SurfaceBaseProps
  extends RecipeProps<'surface'>,
    UnstyledProp {}
export type SurfaceProps = HTMLChakraProps<'div', SurfaceBaseProps>;

export const Surface = withContext<HTMLDivElement, SurfaceProps>('div');
Surface.displayName = 'Surface';
