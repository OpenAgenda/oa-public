import {
  Image,
  VStack,
  Wrap,
  WrapItem,
  LinkOverlay,
  LinkBox,
  Text,
  Box,
  Badge,
  Button,
} from '@openagenda/uikit';
import { defineMessages, useIntl } from 'react-intl';
import { useState } from 'react';
import { color } from 'utils/strapi';
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
  fontColor?: any;
};

const messages = defineMessages({
  more: {
    id: 'next.components.strapi.ReferenceItem.more',
    defaultMessage: '+ {count} more',
  },
});

const sizes = {
  small: {
    container: '260px',
    image: '190px',
  },
  big: {
    container: '320px',
    image: '320px',
  },
};

export default function ReferenceItem({
  link,
  image,
  title,
  tags: tagsString,
  tagColorMap,
  smallImages = true,
  fontColor,
}: ReferenceItemProps) {
  const allTags = tagsString?.split(',').map((tag) => tag.trim());
  const [displayedTags, setDisplayedTags] = useState(
    allTags.filter((_t, i) => i < 5),
  );

  const size = sizes[smallImages ? 'small' : 'big'];
  const intl = useIntl();

  return (
    <LinkBox asChild>
      <VStack
        width={size.container}
        maxWidth={size.container}
        alignItems="center"
        gap={2}
      >
        {title && (
          <Text
            fontSize="lg"
            fontWeight="semibold"
            textAlign="center"
            color={fontColor ? color(fontColor.name, 500) : 'gray.700'}
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
              height={size.image}
              maxW={size.image}
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

        {displayedTags?.length > 0 ? (
          <Wrap justify="center" maxWidth="100%" pt={1}>
            {displayedTags?.map((tag) => (
              <WrapItem key={tag}>
                <Badge
                  variant="solid"
                  border="none"
                  borderRadius={20}
                  size="lg"
                  colorPalette={tagColorMap[tag]}
                >
                  {tag}
                </Badge>
              </WrapItem>
            ))}
            {displayedTags.length < allTags.length ? (
              <Button
                fontSize="md"
                variant="link"
                cursor="pointer"
                borderRadius={20}
                onClick={() => setDisplayedTags(allTags)}
              >
                {intl.formatMessage(messages.more, {
                  count: allTags.length - displayedTags.length,
                })}
              </Button>
            ) : null}
          </Wrap>
        ) : null}
      </VStack>
    </LinkBox>
  );
}

export type { Reference };
