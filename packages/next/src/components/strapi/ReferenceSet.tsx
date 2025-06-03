import {
  Image,
  VStack,
  Wrap,
  WrapItem,
  LinkOverlay,
  LinkBox,
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
  tags?: string;
};

type ReferenceSetProps = {
  title?: string;
  References?: Reference[];
};

function ReferenceItem({ link, image, tags: tagsString }: Reference) {
  const tags = tagsString?.split(',').map((tag) => tag.trim());

  return (
    <LinkBox asChild>
      <VStack
        gap="4"
        p="4"
        border="2px solid"
        borderColor="gray.200"
        borderRadius="lg"
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

        {tags?.length > 0 ? (
          <Wrap justify="center">
            {tags?.map((tag) => (
              <WrapItem key={tag}>
                <Tag size="lg">{tag}</Tag>
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
}: ReferenceSetProps) {
  if (!ReferencesData?.length) {
    return null;
  }

  return (
    <SegmentContainer title={title}>
      <Wrap gap="6">
        {ReferencesData.map((reference) => (
          <WrapItem key={reference.id}>
            <ReferenceItem {...reference} />
          </WrapItem>
        ))}
      </Wrap>
    </SegmentContainer>
  );
}
