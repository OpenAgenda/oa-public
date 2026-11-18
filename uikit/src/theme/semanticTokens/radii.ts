import { defineSemanticTokens } from '@chakra-ui/react';

// The three radii every recipe reads (`l1` for small parts, `l2` for buttons
// and fields, `l3` for dialogs, menus and surfaces). Chakra rounds them more
// with each level; OpenAgenda keeps one discreet radius at every level, the
// one its legacy pages use, so a dialog looks the same on either side.
export const semanticRadii = defineSemanticTokens.radii({
  l1: { value: '{radii.xs}' },
  l2: { value: '{radii.xs}' },
  l3: { value: '{radii.xs}' },
});
