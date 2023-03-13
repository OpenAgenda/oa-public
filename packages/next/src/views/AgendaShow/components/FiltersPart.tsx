import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/pro-solid-svg-icons';
import {
  chakra,
  Box,
  Button,
  CloseButton,
  Flex,
  Text,
  NoBreak,
  Link,
  useDisclosure,
} from '@openagenda/uikit';
import {
  Filters,
  useLoadGeoData,
  useGetFilterOptions,
  useGetTotal,
} from '@openagenda/react-filters';
import useFiltersBaseQuery from '../hooks/useFiltersBaseQuery';
import useEventsQuery from '../hooks/useEventsQuery';
import messages from '../messages';
import Form from './Form';
import Search from './Search';
import MapFilter from './MapFilter';
import DateRangeFilter from './DateRangeFilter';
import ChoiceFilter from './ChoiceFilter';
import FavoritesFilter from './FavoritesFilter';
import ResponsiveDrawer from './Drawer';
import { FiltersSkeleton } from './LoadingPage';

export default function FiltersPart({ agenda, filters, query, includeFields }) {
  const intl = useIntl();

  const upcomingOnly = !query.timings && query.passed !== '1';

  const { data: filtersBaseData } = useFiltersBaseQuery({
    suspense: true,
    agenda,
    filters,
    query,
  });
  const { data: pages, error } = useEventsQuery({
    suspense: true,
    agenda,
    filters,
    query,
    includeFields,
  });

  const aggregations = pages?.[0].aggregations ?? {};
  const total = pages?.[0].total ?? 0;

  const getOptions = useGetFilterOptions(
    intl,
    filtersBaseData?.aggregations,
    aggregations,
  );

  const getTotal = useGetTotal(aggregations);

  const loadGeoData = useLoadGeoData(
    null, // apiClient
    `/api/agendas/slug/${agenda.slug}/events`,
    {
      ...upcomingOnly ? {
        relative: ['current', 'upcoming'],
      } : null,
      ...query,
      passed: undefined, // omit passed
    },
  );

  const {
    isOpen: isOpenFilters,
    onToggle: onToggleFilters,
  } = useDisclosure();

  const isLoadingInitialData = !pages && !error;

  if (isLoadingInitialData) {
    return <FiltersSkeleton />;
  }

  return (
    <Form gap="8" mb={{ base: '0', lg: '12' }}>
      <Search
        disabled={false}
        isLoading={false}
        mx={{ base: '4', lg: '0' }}
      />

      <div>{/* Useful to remove gap for the drawer on mobile */}
        <Flex>
          <Button
            colorScheme="primary"
            onClick={onToggleFilters}
            leftIcon={<FontAwesomeIcon icon={faSliders} />}
            display={{ base: 'flex', lg: 'none' }}
            mx="4"
            w="full"
          >
            {intl.formatMessage(messages.filter)}
          </Button>
        </Flex>

        <ResponsiveDrawer isOpen={isOpenFilters} onClose={onToggleFilters}>
          <Flex direction="column" h="full">
            <Flex
              display={{ base: 'flex', lg: 'none' }}
              justify="space-between"
              align="center"
              p="4"
            >
              <Text fontWeight="bold" fontSize="lg">
                {intl.formatMessage(messages.filters)}
              </Text>
              <CloseButton onClick={onToggleFilters} />
            </Flex>

            <Flex direction="column" gap="8" grow="1" overflow="auto" px={{ base: '4', lg: '0' }}>
              <Filters
                filters={filters}
                // disabled={isFetching || filtersQuery.isFetching}
                mapComponent={MapFilter as any}
                dateRangeComponent={DateRangeFilter as any}
                choiceComponent={ChoiceFilter as any}
                getTotal={getTotal}
                getOptions={getOptions}
                initialViewport={aggregations.viewport}
                loadGeoData={loadGeoData}
                withRef
              />
              <FavoritesFilter agenda={agenda} />
            </Flex>

            <Box display={{ base: 'block', lg: 'none' }} p="4">
              <Button
                variant="solid"
                colorScheme="primary"
                onClick={onToggleFilters}
                w="full"
              >
                {intl.formatMessage(messages.seeEvents, { count: total })}
              </Button>
            </Box>

            <Box display={{ base: 'none', lg: 'block' }} pt="8" wordBreak="normal">
              <Link href="/" color="primary.500">
                OpenAgenda
              </Link>
              <NoBreak>&nbsp;·</NoBreak>{' '}
              <Link href="https://doc.openagenda.com/" isExternal color="primary.500">
                {intl.formatMessage(messages.help)}
              </Link>
              <NoBreak>&nbsp;·</NoBreak>{' '}
              <Link href="https://doc.openagenda.com/conditions/" isExternal color="primary.500">
                {intl.formatMessage(messages.termsOfUse)}
              </Link>

              <br />
              <chakra.span color="oaGray.300" wordBreak="normal">&lt;uid:{agenda.uid}&gt;</chakra.span>
            </Box>
          </Flex>
        </ResponsiveDrawer>
      </div>
    </Form>
  );
}
