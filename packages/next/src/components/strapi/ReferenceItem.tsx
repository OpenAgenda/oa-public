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

type ReferenceItemProps = Reference & {
  tagColorMap: Record<string, string>;
  smallIllustrations?: boolean;
};

export default function ReferenceItem({
  link,
  image,
  title,
  tags: tagsString,
  tagColorMap,
  smallIllustrations = true,
}: ReferenceItemProps) {
  const tags = tagsString?.split(',').map((tag) => tag.trim());

  return (
    <LinkBox asChild>
      <VStack
        width={smallIllustrations ? '280px' : '360px'}
        maxWidth={smallIllustrations ? '280px' : '360px'}
        alignItems="center"
      >
        <LinkOverlay href={link} target="_blank" rel="noopener noreferrer">
          <Image
            src={`${image.url}`}
            alt={image.alternativeText}
            height={smallIllustrations ? '200px' : '360px'}
            maxW={smallIllustrations ? '200px' : '360px'}
            objectFit={smallIllustrations ? 'contain' : 'cover'}
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
          <Wrap justify="center" maxWidth="100%" pt={title ? '0' : '3'}>
            {tags?.map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  variant="solid"
                  border="none"
                  borderRadius={2}
                  size="lg"
                  colorPalette={tagColorMap[tag]}
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

export type { Reference };
