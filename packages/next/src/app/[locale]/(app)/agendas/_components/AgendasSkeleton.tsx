'use client';

import { Container, VStack } from '@openagenda/uikit';
import { Skeleton, SkeletonText } from '@openagenda/uikit/snippets';

export default function AgendasSkeleton() {
  return (
    <Container maxW="3xl" bg="white" my="20" p="12">
      <Skeleton height="40px" width="60%" mb="8" />
      <VStack align="stretch" gap="8">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonText key={i} noOfLines={3} gap="4" />
        ))}
      </VStack>
    </Container>
  );
}
