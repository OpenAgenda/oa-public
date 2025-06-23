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

export default function ReferenceItem({
  link,
  image,
  title,
  tags: tagsString,
}: Reference) {
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

export type { Reference };
