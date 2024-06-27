import { Flex, Skeleton, SkeletonText, SimpleGrid } from '@openagenda/uikit';

export function EventSkeleton() {
  return (
    <Flex direction="column" border="1px solid #00000026">
      <Skeleton h="170px" />
      <Flex direction="column" p="6" gap="2" grow="1" minH="170px">
        <SkeletonText skeletonHeight="3" />
        <SkeletonText mt="auto" noOfLines={1} w="40%" />
      </Flex>
    </Flex>
  );
}

export function EventsSkeleton() {
  return (
    <SimpleGrid templateColumns="repeat(auto-fill, minmax(min(290px, 100%), 1fr))" spacing="10">
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
    </SimpleGrid>
  );
}
