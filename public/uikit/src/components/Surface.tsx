'use client';

import { chakra } from '@chakra-ui/react';
import type { ComponentProps } from 'react';
import { surfaceRecipe } from '../theme/recipes/surface';

// Shared content surface — see theme/recipes/surface.ts. Built with the chakra
// factory (not the client-only `useRecipe` hook) so it renders inside Server
// Components; `asChild`, `ref`, and style props are supported natively. Flat by
// default (bg + radius, no border/shadow); callers pass their own layout.
export const Surface = chakra('div', surfaceRecipe);

export type SurfaceProps = ComponentProps<typeof Surface>;
