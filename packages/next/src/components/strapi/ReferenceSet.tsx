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
};

export default function ReferenceSet({
  title = null,
  description,
  References: ReferencesData,
  hasFilter = false,
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
    <SegmentContainer title={title} description={description}>
      {hasFilter && (
        <ReferenceFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
        />
      )}

      <Wrap gap="6" justify="center">
        {filteredReferences.map((reference) => (
          <WrapItem key={reference.id}>
            <ReferenceItem {...reference} />
          </WrapItem>
        ))}
      </Wrap>
    </SegmentContainer>
  );
}
