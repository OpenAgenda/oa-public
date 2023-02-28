import { chakra, Skeleton, Flex, Box, Stack } from '@openagenda/uikit';
import ContentGrid from './ContentGrid';

function EventSkeleton() {
  return (
    <Flex
      direction={{ base: 'column', xl: 'row' }}
      gap={{ base: '2', xl: '8' }}
      mx={{ base: 'auto', xl: '0' }}
      px={{ base: '4', xl: '0' }}
      maxW={{ base: 'xl', xl: 'none' }}
      w="full"
    >
      <Box as="aside" w={{ base: 'full', xl: '25%' }} mt={{ xl: '4' }}>
        <Flex justify={{ base: 'flex-start', xl: 'flex-end' }}>
          <Skeleton h="3" w="120px" />
        </Flex>
      </Box>

      <Flex direction="column" w={{ base: 'full', xl: '75%' }}>
        <Skeleton h="96" />
      </Flex>
    </Flex>
  );
}

function CheckboxSkeleton() {
  return (
    <Flex gap="2">
      <Skeleton h="4" w="4" />
      <Skeleton h="4" w="full" maxW="250px" />
    </Flex>
  );
}

function FilterSkeleton() {
  return (
    <chakra.div>
      <Skeleton h="5" maxW="200px" mb="3" />
      <Stack spacing="2" mb="2">
        <CheckboxSkeleton />
        <CheckboxSkeleton />
        <CheckboxSkeleton />
      </Stack>
    </chakra.div>
  );
}

export default function LoadingPage() {
  return (
    <ContentGrid
      total={(
        <Skeleton h="4" w="full" maxW="300px" alignSelf="center" />
      )}
      filters={(
        <>
          <Flex display={{ base: 'none', lg: 'flex' }} direction="column" gap="8" mb="12">
            <Skeleton h="50px" /> {/* Search */}
            <Skeleton h="250px" /> {/* Map */}
            <Flex direction="column" gap="8" grow="1" overflow="auto" px={{ base: '4', lg: '0' }}>
              <FilterSkeleton />
              <FilterSkeleton />
            </Flex>
          </Flex>

          <Flex display={{ base: 'flex', lg: 'none' }} direction="column" gap="8" mx="4">
            <Skeleton h="50px" /> {/* Search */}
            <Skeleton h="10" /> {/* Filter button */}
          </Flex>
        </>
      )}
      events={(
        <Flex direction="column" flex="2" gap="10" mb="12">
          <EventSkeleton />
          <EventSkeleton />
        </Flex>
      )}
    />
  );
}
