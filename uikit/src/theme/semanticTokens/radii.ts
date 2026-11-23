import { defineSemanticTokens } from '@chakra-ui/react';

// The three radii every recipe reads (`l1` for small parts, `l2` for buttons,
// `l3` for dialogs, menus and surfaces). Chakra rounds them more with each
// level; OpenAgenda keeps one discreet radius at every level, the one the
// content and the containers of its legacy pages use, so a dialog looks the
// same on either side.
//
// A field where one types or picks a value — input, textarea, select — is
// rounded a step more (`field`), as the legacy forms round theirs: the recipes
// of those fields read it in place of `l2`.
export const semanticRadii = defineSemanticTokens.radii({
  l1: { value: '{radii.xs}' },
  l2: { value: '{radii.xs}' },
  l3: { value: '{radii.xs}' },
  field: { value: '{radii.sm}' },
});
