import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/pro-solid-svg-icons';
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Link,
  NoBreak,
  Portal,
  useBreakpointValue,
} from '@openagenda/uikit';
import {
  Filters,
  useLoadGeoData,
  useGetFilterOptions,
  useGetTotal,
} from '@openagenda/react-filters';
import isUpcomingOnlyQuery from 'utils/isUpcomingOnlyQuery';
import CopyIdentifier from 'components/CopyIdentifier';
import useFiltersBaseQuery from '../hooks/useFiltersBaseQuery';
import useEventsQuery from '../hooks/useEventsQuery';
import messages from '../messages';
import Form from './Form';
import Search from './Search';
import MapFilter from './MapFilter';
import DateRangeFilter from './DateRangeFilter';
import ChoiceFilter from './ChoiceFilter';
import FavoritesFilter from './FavoritesFilter';
import { FiltersSkeleton } from './LoadingPage';

export default function FiltersPart({ agenda, filters, query, includeFields }) {
  const intl = useIntl();

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
      ...isUpcomingOnlyQuery(query)
        ? {
            relative: ['current', 'upcoming'],
          }
        : null,
      ...query,
      passed: undefined, // omit passed
    },
  );

  // TODO test fallback, disable ssr, default false...
  const isSmall = useBreakpointValue({ base: true, lg: false });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Close drawer on larger screens
    if (!isSmall) {
      setOpen(false);
    }
  }, [isSmall]);

  const isLoadingInitialData = !pages && !error;

  if (isLoadingInitialData) {
    return <FiltersSkeleton />;
  }

  const filtersElement = (
    <>
      <Flex
        direction="column"
        gap="8"
        grow="1"
        overflow="auto"
        px={{ base: '4', lg: '0' }}
      >
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

      <CopyIdentifier
        identifier={agenda.uid}
        display={{ base: 'none', lg: 'inline-flex' }}
        size="sm"
        maxW="220px"
      />

      <Box display={{ base: 'none', lg: 'block' }} wordBreak="normal">
        <Link href="/" color="primary.500">
          OpenAgenda
        </Link>
        <NoBreak>&nbsp;·</NoBreak>{' '}
        <Link
          href="https://doc.openagenda.com/"
          target="_blank"
          rel="noopener"
          color="primary.500"
        >
          {intl.formatMessage(messages.help)}
        </Link>
        <NoBreak>&nbsp;·</NoBreak>{' '}
        <Link
          href="https://doc.openagenda.com/conditions/"
          target="_blank"
          rel="noopener noreferrer"
          color="primary.500"
        >
          {intl.formatMessage(messages.termsOfUse)}
        </Link>
      </Box>
    </>
  );

  return (
    <Form gap="8" mb={{ base: '0', lg: '12' }}>
      <Search disabled={false} isLoading={false} mx={{ base: '4', lg: '0' }} />

      <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="md">
        <Drawer.Trigger asChild>
          <Button
            display={{ base: 'flex', lg: 'none' }}
            mx="4"
            justifySelf="stretch"
          >
            <FontAwesomeIcon icon={faSliders} />
            {intl.formatMessage(messages.filter)}
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>
                  {intl.formatMessage(messages.filters)}
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>{filtersElement}</Drawer.Body>
              <Drawer.Footer>
                <Button onClick={() => setOpen(false)} flex="1">
                  {intl.formatMessage(messages.seeEvents, { count: total })}
                </Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      {!isSmall ? filtersElement : null}
    </Form>
  );
}
