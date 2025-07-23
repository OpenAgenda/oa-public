import {
  Image,
  VStack,
  Wrap,
  WrapItem,
  LinkOverlay,
  LinkBox,
  Text,
  Box,
} from '@openagenda/uikit';
import { Tag } from '@openagenda/uikit/snippets';
import Icon from './Icon';

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
  smallImages?: boolean;
};

export default function ReferenceItem({
  link,
  image,
  title,
  tags: tagsString,
  tagColorMap,
  smallImages = true,
}: ReferenceItemProps) {
  const tags = tagsString?.split(',').map((tag) => tag.trim());

  return (
    <LinkBox asChild>
      <VStack
        width={smallImages ? '300px' : '380px'}
        maxWidth={smallImages ? '300px' : '380px'}
        alignItems="center"
        gap={2}
      >
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

        <Box
          position="relative"
          display="inline-block"
          _hover={{
            '& .hover-overlay': {
              opacity: 1,
            },
          }}
        >
          <LinkOverlay href={link} target="_blank" rel="noopener noreferrer">
            <Image
              src={`${image.url}`}
              alt={image.alternativeText}
              height={smallImages ? '220px' : '380px'}
              maxW={smallImages ? '220px' : '380px'}
              objectFit="cover"
            />
          </LinkOverlay>

          {/* Hover overlay */}
          <Box
            className="hover-overlay"
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            opacity="0"
            transition="opacity 0.2s ease-in-out"
            pointerEvents="none"
          >
            <Icon
              name="up-right-from-square"
              size="fa-2x"
              style="regular"
              color="white"
            />
          </Box>
        </Box>

        {tags?.length > 0 ? (
          <Wrap justify="center" maxWidth="100%" pt={1}>
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
