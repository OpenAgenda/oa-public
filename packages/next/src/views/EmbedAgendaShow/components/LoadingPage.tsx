import { useMemo } from 'react';
import {
  Box,
  Flex,
  Skeleton,
  SkeletonText,
  SimpleGrid,
} from '@openagenda/uikit';

export function EventSkeleton() {
  return (
    <Flex direction="column" border="1px solid #00000026">
      <Skeleton h="170px" />
      <Flex direction="column" p="6" gap="2" grow="1" minH="170px">
        <SkeletonText height="3" />
        <SkeletonText mt="auto" noOfLines={1} w="40%" />
      </Flex>
    </Flex>
  );
}

export function EventsSkeleton() {
  return (
    <SimpleGrid
      templateColumns="repeat(auto-fill, minmax(min(290px, 100%), 1fr))"
      columnGap="10"
      rowGap="6"
    >
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

export function FiltersSkeleton({ filters, filtersToInclude }) {
  const orderedFilters = useMemo(
    () =>
      filters
        .filter((filter) => filtersToInclude.includes(filter.name))
        .sort((a, b) => {
          // Last
          if (a.name === 'geo') return 1;
          if (b.name === 'geo') return -1;
          // Second to last
          if (a.name === 'search') return 1;
          if (b.name === 'search') return -1;
          return (
            filtersToInclude.indexOf(a.name) - filtersToInclude.indexOf(b.name)
          );
        }),
    [filters, filtersToInclude],
  );

  return (
    <SimpleGrid
      templateColumns="repeat(auto-fill, minmax(min(290px, 100%), 1fr))"
      columnGap="10"
      rowGap="6"
    >
      {orderedFilters.map((filter) => {
        if (filter.name === 'geo') {
          return (
            <Box key="geo" gridColumn="1 / -1">
              <Skeleton h="250px" />
              <Skeleton mt="2" mb="1" w="full" maxW="220px" h="4" />
            </Box>
          );
        }
        if (filter.name === 'search') {
          return <Skeleton key="search" h="10" gridColumn="1 / -1" />;
        }
        return <Skeleton key={filter.name} h="10" />;
      })}
    </SimpleGrid>
  );
}
