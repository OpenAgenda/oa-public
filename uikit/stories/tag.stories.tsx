import { HStack, Text, VStack } from '../src';
import { Tag } from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Tag',
  decorators: [Provider],
};

const PALETTES = ['primary', 'warning', 'danger', 'oaGray', 'green'];
const VARIANTS = ['surface', 'subtle', 'solid', 'outline'] as const;

// `surface`, the default, and `subtle` are redefined by the OA recipe (see
// `theme/recipes/tag.ts`) for their text to be readable on every palette.
// The other two are Chakra's, shown to tell a gap by eye.
export function All() {
  return (
    <VStack gap="6" align="start">
      {VARIANTS.map((variant) => (
        <VStack key={variant} gap="2" align="start">
          <Text textStyle="sm">variant: {variant}</Text>
          <HStack gap="3">
            {PALETTES.map((palette) => (
              <Tag key={palette} colorPalette={palette} variant={variant}>
                {palette}
              </Tag>
            ))}
          </HStack>
        </VStack>
      ))}
      <VStack gap="2" align="start">
        <Text textStyle="sm">closable, its button named by `closeLabel`</Text>
        <Tag closable closeLabel="Remove French" onClose={() => {}}>
          French
        </Tag>
      </VStack>
    </VStack>
  );
}

All.storyName = 'Tag';
