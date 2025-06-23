import { VStack, Wrap, WrapItem } from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';

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
              <Tag
                as="button"
                variant={isSelected ? 'solid' : 'outline'}
                border="1px solid"
                borderColor={isSelected ? `${tagColor}.600` : `${tagColor}.600`}
                borderRadius={0}
                size="lg"
                colorPalette={isSelected ? tagColor : 'gray'}
                cursor="pointer"
                onClick={() => onToggleTag(tag)}
                _hover={{
                  borderColor: `${tagColor}.600`,
                  bg: isSelected ? `${tagColor}.600` : `${tagColor}.50`,
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
