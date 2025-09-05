import { VStack, Wrap, WrapItem, Badge } from '@openagenda/uikit';
import { color } from 'utils/strapi';

type ReferenceFilterProps = {
  allTags: string[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
  tagColorMap: Record<string, string>;
};

export default function ReferenceFilter({
  allTags,
  selectedTags,
  onToggleTag,
  tagColorMap,
}: ReferenceFilterProps) {
  if (allTags.length === 0) {
    return null;
  }

  return (
    <VStack gap="4" mb="8">
      <Wrap gap="2" justify="center">
        {allTags.map((tag) => {
          const isSelected = selectedTags.has(tag);
          const tagColor = tagColorMap[tag];
          return (
            <WrapItem key={tag}>
              <Badge
                as="button"
                fontWeight={700}
                variant={isSelected ? 'solid' : 'outline'}
                borderRadius={20}
                size="lg"
                colorPalette={color(tagColor)}
                cursor="pointer"
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </Badge>
            </WrapItem>
          );
        })}
      </Wrap>
    </VStack>
  );
}
