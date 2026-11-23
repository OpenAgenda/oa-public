import { defineSemanticTokens } from '@chakra-ui/react';

// The three radii every recipe reads (`l1` for small parts, `l2`, `l3` for
// dialogs, menus and surfaces). Chakra rounds them more with each level;
// OpenAgenda keeps one discreet radius at every level, the one the content
// and the containers of its legacy pages use, so a dialog looks the same on
// either side.
//
// What one acts on in a form — a field where a value is typed or picked, and
// the buttons beside it — is rounded a step more (`control`), as the legacy
// forms round theirs: a button and an input side by side are of one family.
// Their recipes read it in place of `l2`.
export const semanticRadii = defineSemanticTokens.radii({
  l1: { value: '{radii.xs}' },
  l2: { value: '{radii.xs}' },
  l3: { value: '{radii.xs}' },
  control: { value: '{radii.sm}' },
});
