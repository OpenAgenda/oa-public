import { useState, useMemo } from 'react';
import { chakra, Wrap, WrapItem } from '@openagenda/uikit';
import { allowedItemColors , color } from 'utils/strapi';
import SegmentContainer from './SegmentContainer';
import ReferenceItem, { type Reference } from './ReferenceItem';
import ReferenceFilter from './ReferenceFilter';

type ReferenceSetProps = {
  title?: string;
  description?: string;
  References?: Reference[];
  hasFilter?: boolean;
  smallImages?: boolean;
  CTAs?: any[];
  backgroundColor?: any;
};

const StyledSegmentContainer = chakra(SegmentContainer);

export default function ReferenceSet({
  title = null,
  description,
  References: ReferencesData,
  hasFilter = false,
  smallImages = true,
  CTAs,
  backgroundColor,
}: ReferenceSetProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => {
    if (!ReferencesData?.length) return [];

    const tagsSet = new Set<string>();
    ReferencesData.forEach((reference) => {
      if (reference.tags) {
        reference.tags.split(',').forEach((tag) => {
          tagsSet.add(tag.trim());
        });
      }
    });

    return Array.from(tagsSet).sort();
  }, [ReferencesData]);

  const tagColorMap = useMemo(() => {
    const colorMap: Record<string, string> = {};
    allTags.forEach((tag, index) => {
      colorMap[tag] = allowedItemColors[index % allowedItemColors.length];
    });
    return colorMap;
  }, [allTags]);

  const filteredReferences = useMemo(() => {
    if (!ReferencesData?.length || selectedTags.size === 0) {
      return ReferencesData || [];
    }

    return ReferencesData.filter((reference) => {
      if (!reference.tags) return false;

      const referenceTags = reference.tags.split(',').map((tag) => tag.trim());
      return Array.from(selectedTags).some((selectedTag) =>
        referenceTags.includes(selectedTag),
      );
    });
  }, [ReferencesData, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  if (!ReferencesData?.length) {
    return null;
  }

  return (
    <StyledSegmentContainer
      title={title}
      description={description}
      CTAs={CTAs}
      colorPalette={backgroundColor}
      bg={
        !backgroundColor || backgroundColor.name === 'white'
          ? 'white'
          : color(backgroundColor.name, 'subtle')
      }
    >
      {hasFilter && (
        <ReferenceFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          tagColorMap={tagColorMap}
        />
      )}

      <Wrap gap="10" justify="center">
        {filteredReferences.map((reference) => (
          <WrapItem key={reference.id}>
            <ReferenceItem
              {...reference}
              tagColorMap={tagColorMap}
              smallImages={smallImages !== false}
            />
          </WrapItem>
        ))}
      </Wrap>
    </StyledSegmentContainer>
  );
}
