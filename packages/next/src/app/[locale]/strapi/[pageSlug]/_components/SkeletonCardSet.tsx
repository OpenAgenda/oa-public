import { HStack } from '@openagenda/uikit';
import { SkeletonFeaturedCard } from '@/src/components/strapi/FeaturedCard';
import SegmentContainer from '@/src/components/strapi/SegmentContainer';

interface SkeletonCardSetProps {
  count?: number;
}

export default function SkeletonCardSet({ count = 3 }: SkeletonCardSetProps) {
  return (
    <SegmentContainer additionalTopPadding={undefined}>
      <HStack gap={12} align="stretch" justify="center" flexWrap="wrap">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonFeaturedCard key={i} />
        ))}
      </HStack>
    </SegmentContainer>
  );
}
