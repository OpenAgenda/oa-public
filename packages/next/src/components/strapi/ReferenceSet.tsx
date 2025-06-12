import { useState, useMemo } from 'react';
import {
  Image,
  VStack,
  Wrap,
  WrapItem,
  LinkOverlay,
  LinkBox,
  Text,
} from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import SegmentContainer from './SegmentContainer';

type Reference = {
  id: string;
  link?: string;
  image: {
    url: string;
    alternativeText?: string;
  };
  title?: string;
  tags?: string;
};

type ReferenceSetProps = {
  title?: string;
  References?: Reference[];
  hasFilter?: boolean;
};

function ReferenceItem({ link, image, title, tags: tagsString }: Reference) {
  const tags = tagsString?.split(',').map((tag) => tag.trim());

  return (
    <LinkBox asChild>
      <VStack
        gap="4"
        p="4"
        border="2px solid"
        borderColor="gray.200"
        borderRadius="lg"
        width="280px"
        maxWidth="280px"
        alignItems="center"
      >
        <LinkOverlay href={link} target="_blank" rel="noopener noreferrer">
          <Image
            src={`${image.url}`}
            alt={image.alternativeText}
            height="200px"
            maxW="200px"
            objectFit="contain"
          />
        </LinkOverlay>

        {title && (
          <Text
            fontSize="lg"
            fontWeight="semibold"
            textAlign="center"
            color="gray.700"
            px="2"
            wordBreak="break-word"
          >
            {title}
          </Text>
        )}

        {tags?.length > 0 ? (
          <Wrap justify="center" maxWidth="100%">
            {tags?.map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  variant="solid"
                  border="none"
                  size="lg"
                  colorPalette="strapi.darkPink"
                >
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}
      </VStack>
    </LinkBox>
  );
}

export default function ReferenceSet({
  title = null,
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
    <SegmentContainer title={title}>
      {hasFilter && allTags.length > 0 && (
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
                    borderColor={
                      isSelected ? 'strapi.darkPink.600' : 'gray.300'
                    }
                    size="lg"
                    colorPalette={isSelected ? 'strapi.darkPink' : 'gray'}
                    cursor="pointer"
                    onClick={() => toggleTag(tag)}
                    _hover={{
                      borderColor: 'strapi.darkPink.600',
                      bg: isSelected
                        ? 'strapi.darkPink.600'
                        : 'strapi.darkPink.50',
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
