import { VStack, Wrap, WrapItem } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';

type ReferenceFilterProps = {
  allTags: string[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
};

export default function ReferenceFilter({
  allTags,
  selectedTags,
  onToggleTag,
}: ReferenceFilterProps) {
  if (allTags.length === 0) {
    return null;
  }

  return (
    <VStack gap="4" mb="8">
      <Wrap gap="2" justify="center">
        {allTags.map((tag) => {
          const isSelected = selectedTags.has(tag);
          return (
            <WrapItem key={tag}>
              <Tag
                as="button"
                variant={isSelected ? 'solid' : 'outline'}
                border="1px solid"
                borderColor={isSelected ? 'strapi.darkPink.600' : 'gray.300'}
                size="lg"
                colorPalette={isSelected ? 'strapi.darkPink' : 'gray'}
                cursor="pointer"
                onClick={() => onToggleTag(tag)}
                _hover={{
                  borderColor: 'strapi.darkPink.600',
                  bg: isSelected ? 'strapi.darkPink.600' : 'strapi.darkPink.50',
                }}
                transition="all 0.2s"
              >
                {tag}
              </Tag>
            </WrapItem>
          );
        })}
      </Wrap>
    </VStack>
  );
}
