import { ReactElement } from 'react';
import { useIntl, FormattedDate } from 'react-intl';
import { Button, chakra, Flex, FlexProps, Link } from '@openagenda/uikit';
import ActivityItem from '@openagenda/activity-apps/src/client/components/ActivityItem';
import isNextUrl from 'utils/isNextUrl';
import NextChakraLink from 'components/NextChakraLink';
import messages from '../../messages';
import { useActivitiesContext } from './context';

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

type ActivitiesListProps = {
  emptyElem?: ReactElement
} & FlexProps;

export function ActivitiesList({ emptyElem = null, ...props }: ActivitiesListProps) {
  const intl = useIntl();

  const {
    pages,
    error,
    isLoadingInitialData,
    isEmpty,
    isReachingEnd,
    isLoadingMore,
    nextPage,
  } = useActivitiesContext();

  if (isLoadingInitialData || isEmpty || error) {
    return emptyElem;
  }

  const { config } = pages[0];

  return (
    <Flex
      display="flex"
      direction="column"
      gap="4"
      position="relative"
      // mt="8"
      // py="4"
      bg="white"
      // border="1px solid"
      // borderColor="oaGray.100"
      borderRadius="sm"
      // _hover={{
      //   borderColor: 'primary.500',
      // }}
      {...props}
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
          {intl.formatMessage(messages.seeMore)}
        </Button>
      ) : null}
    </Flex>
  );
}
