'use client';

import { Box, Container, VStack } from '@openagenda/uikit';
import { Skeleton, SkeletonText } from '@openagenda/uikit/snippets';

export default function AgendaLoading() {
  return (
    <>
      <Box as="header" w="full" bg="darkPurple.500" px="4" py="8">
        <Container maxW="7xl">
          <Skeleton height="48px" width="40%" />
        </Container>
      </Box>
      <Container maxW="7xl" py="8">
        <VStack align="stretch" gap="8">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonText key={i} noOfLines={3} gap="4" />
          ))}
        </VStack>
      </Container>
    </>
  );
}
