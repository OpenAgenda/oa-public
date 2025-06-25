import { useState, useMemo } from 'react';
import { Wrap, WrapItem } from '@openagenda/uikit';
import SegmentContainer from './SegmentContainer';
import ReferenceItem, { type Reference } from './ReferenceItem';
import ReferenceFilter from './ReferenceFilter';

type ReferenceSetProps = {
  title?: string;
  description?: string;
  References?: Reference[];
  hasFilter?: boolean;
  CTAs?: any[];
};

const allowedTagColors = [
  'strapi.flashy.rosyRed',
  'strapi.flashy.blueViolet',
  'strapi.flashy.paleLavender',
  'strapi.flashy.blueGreen',
  'strapi.flashy.sandBeige',
  'strapi.flashy.mutedPlum',
];

export default function ReferenceSet({
  title = null,
  description,
  References: ReferencesData,
  hasFilter = false,
  CTAs,
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
      colorMap[tag] = allowedTagColors[index % allowedTagColors.length];
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
    <SegmentContainer title={title} description={description} CTAs={CTAs}>
      {hasFilter && (
        <ReferenceFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          tagColorMap={tagColorMap}
        />
      )}

      <Wrap gap="6" justify="center" mt="10">
        {filteredReferences.map((reference) => (
          <WrapItem key={reference.id}>
            <ReferenceItem {...reference} tagColorMap={tagColorMap} />
          </WrapItem>
        ))}
      </Wrap>
    </SegmentContainer>
  );
}
