import {
  Image,
  Text,
  Box,
  VStack,
  Skeleton,
  SkeletonText,
  ButtonProps,
} from '@openagenda/uikit';
import { nl2br } from '@openagenda/react-shared';
import CTAButtons from './CTAButtons';
import type { Color } from './types';

interface Card {
  image: {
    url: string;
  };
  title: string;
  description: string;
  slug?: string;
  CTAs?: Array<{
    label: string;
    link: string;
    color?: Color;
    variant?: ButtonProps['variant'];
  }>;
}

interface FeaturedCardProps {
  card: Card;
}

const imageSize = '120px';

export function FeaturedCard({ card }: FeaturedCardProps) {
  return (
    <VStack gap={6} flex={1} maxW={360} minW={240} mb={4}>
      <Image
        src={card.image.url}
        alt={card.title}
        boxSize={imageSize}
        objectFit="cover"
        borderRadius="full"
      />
      <Text height="40px" fontWeight="bold" fontSize="md" textAlign="center">
        {card.title}
      </Text>
      <Text flexGrow={3} fontSize="sm" color="gray.600" textAlign="left">
        {nl2br(card.description)}
      </Text>
      {(card.CTAs ?? []).length ? (
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          width="full"
          fontSize="sm"
        >
          <CTAButtons CTAs={card.CTAs} justify="center" size="md" />
        </Box>
      ) : null}
    </VStack>
  );
}

export function SkeletonFeaturedCard() {
  return (
    <VStack gap={6} flex={1} maxW={360} minW={240}>
      <Skeleton h={imageSize} w={imageSize} borderRadius="full" />
      <SkeletonText noOfLines={1} height="4" mx="auto" my="2" w="80%" />
      <SkeletonText noOfLines={3} height="3" />
    </VStack>
  );
}
