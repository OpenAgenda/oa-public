'use client';

import { Box, Container, VStack } from '@openagenda/uikit';
import { Skeleton, SkeletonText } from '@openagenda/uikit/snippets';

export default function EventLoading() {
  return (
    <>
      <Box as="header" w="full" bg="darkPurple.500" px="4" py="8">
        <Container maxW="5xl">
          <Skeleton height="48px" width="40%" />
        </Container>
      </Box>
      <Container maxW="7xl" py="8">
        <VStack align="stretch" gap="6">
          <Skeleton height="40px" width="60%" />
          <SkeletonText noOfLines={6} gap="3" />
          <Skeleton height="320px" />
        </VStack>
      </Container>
    </>
  );
}
