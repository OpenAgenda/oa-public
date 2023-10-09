import { useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { FormattedDate } from 'react-intl';
import { chakra, Heading, Link, Flex, Button } from '@openagenda/uikit';
import ActivityItem from '@openagenda/activity-apps/src/client/components/ActivityItem';
import isNextUrl from 'utils/isNextUrl';
import NextChakraLink from '../../../../components/NextChakraLink';

const PAGE_SIZE = 20;

function renderHighlight(content) {
  return (
    <chakra.span color="black">{content}</chakra.span>
  );
}

function renderLink(link, content) {
  if (isNextUrl(link)) {
    return <NextChakraLink href={link} colorScheme="primary">{content}</NextChakraLink>;
  }

  return (
    <Link href={link} colorScheme="primary">{content}</Link>
  );
}

function Activity({ formattedActivity, activity, isBrowser }) {
  return (
    <chakra.div color="oaGray.500">
      <div>{formattedActivity}</div>
      <chakra.div visibility={isBrowser ? 'visible' : 'hidden'}>
        <FormattedDate value={activity.createdAt} dateStyle="long" timeStyle="short" />
      </chakra.div>
    </chakra.div>
  );
}

export default function Activities({ agenda, event }) {
  const {
    data: pages,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.activities?.length) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['EventShow', 'activities', agenda.uid, event.uid, pageIndex, 0];

      // add the cursor to the API endpoint
      const fromId = previousPageData.activities[previousPageData.activities.length - 1].id;
      return ['EventShow', 'activities', agenda.uid, event.uid, pageIndex, fromId];
    },
    ([_comp, _requestId, agendaUid, eventUid, pageIndex, fromId]) =>
      fetch(`/agendas/${agendaUid}/events/${eventUid}/activities?fromId=${fromId}${pageIndex === 0 ? '&withConfig=1' : ''}`)
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Can\'t list activities');
        }),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.activities?.length === 0;
  const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.activities?.length < PAGE_SIZE);

  const nextPage = useCallback(e => {
    e.preventDefault();
    setSize(s => s + 1);
  }, [setSize]);

  console.log({
    pages,
    error,
    size,
    setSize,
  });
  console.log({
    isLoadingInitialData,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
  });

  if (isLoadingInitialData || isEmpty) {
    return null;
  }

  const { config } = pages[0];

  return (
    <div>
      <Heading as="h2" fontSize="2xl" mb="4">Historique</Heading>
      <Flex
        display="flex"
        direction="column"
        gap="4"
        position="relative"
        // mt="8"
        // py="4"
        p="8"
        bg="white"
        // border="1px solid"
        // borderColor="oaGray.100"
        borderRadius="sm"
        // _hover={{
        //   borderColor: 'primary.500',
        // }}
      >
        {pages.map(page =>
          page.activities.map(activity => (
            <ActivityItem
              key={activity.id}
              config={config}
              activity={activity}
              renderHighlight={renderHighlight}
              renderLink={renderLink}
              component={Activity}
            />
          )))}

        {!isLoadingInitialData && !isReachingEnd ? (
          <Button
            onClick={nextPage}
            isLoading={isLoadingMore}
            m="auto"
          >
            Voir plus
          </Button>
        ) : null}
      </Flex>
    </div>
  );
}
