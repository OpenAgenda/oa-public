import { Badge, HStack, Text, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Badge',
  decorators: [Provider],
};

const PALETTES = ['primary', 'warning', 'danger', 'oaGray', 'green'];

// `subtle` est redéfini par la recette OA (voir `theme/recipes/badge.ts`) :
// Chakra y posait un pas médian de la rampe sur un fond déjà saturé, ce qui
// rendait « warning » illisible. La ligne du bas est là pour qu'un écart se
// voie à l'œil sans avoir à mesurer, et pour montrer que `solid` — la variante
// dont vivent `StatusTag` et `EventStatusBadge` — n'a pas bougé.
export function All() {
  return (
    <VStack gap="6" align="start">
      <VStack gap="2" align="start">
        <Text textStyle="sm">variant : solid</Text>
        <HStack gap="3">
          {PALETTES.map((palette) => (
            <Badge key={palette} colorPalette={palette} variant="solid">
              {palette}
            </Badge>
          ))}
        </HStack>
      </VStack>

      <VStack gap="2" align="start">
        <Text textStyle="sm">variant : subtle</Text>
        <HStack gap="3">
          {PALETTES.map((palette) => (
            <Badge key={palette} colorPalette={palette} variant="subtle">
              {palette}
            </Badge>
          ))}
        </HStack>
      </VStack>

      <VStack gap="2" align="start">
        <Text textStyle="sm">variant : outline</Text>
        <HStack gap="3">
          {PALETTES.map((palette) => (
            <Badge key={palette} colorPalette={palette} variant="outline">
              {palette}
            </Badge>
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
}

All.storyName = 'Badge';
