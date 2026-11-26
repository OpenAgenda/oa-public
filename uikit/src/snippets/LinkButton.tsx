'use client';

import type { HTMLChakraProps, RecipeProps } from '@chakra-ui/react';
import { createRecipeContext } from '@chakra-ui/react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinkButtonProps
  extends HTMLChakraProps<'a', RecipeProps<'button'>> {}

const { withContext } = createRecipeContext({ key: 'button' });

// A link styled as a button: an `a`, so that it navigates and is read as a
// link. `asChild` puts a framework's link component (next/link) in its place.
export const LinkButton = withContext<HTMLAnchorElement, LinkButtonProps>('a');
