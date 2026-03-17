import { ReactElement, useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useIntl, FormattedDate } from 'react-intl';
import {
  Button,
  chakra,
  Flex,
  FlexProps,
  Link,
  Spinner,
  useDisclosure,
} from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
} from '@openagenda/uikit/snippets';
import ActivityItem from '@openagenda/activity-apps/src/client/components/ActivityItem';
import { fromMarkdownToHTML } from '@openagenda/md';
import isNextUrl from 'utils/isNextUrl';
import messages from '../../messages';
import { useActivitiesContext } from './context';

function ActivityDetail({ activity, config }) {
  const intl = useIntl();
  const { detailLabelIds } = config[activity.verb];
  const { id: activityId } = activity;
  const {
    open: detailIsOpen,
    onOpen: detailOnOpen,
    onClose: detailOnClose,
  } = useDisclosure({ defaultOpen: false });
  const [isLoading, setIsLoading] = useState(false);
  const [activityDetail, setActivityDetail] = useState(null);

  useEffect(() => {
    if (detailIsOpen) {
      fetch(`/activities/${activityId}`)
        .then(async (response) => {
          const responseJson = await response.json();
          setActivityDetail(
            responseJson.activity.detail
              ? JSON.parse(responseJson.activity.detail)
              : null,
          );
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err);
        });
    }
  }, [activityId, detailIsOpen]);
  return (
    <chakra.div color="oaGray.600">
      <Button onClick={detailOnOpen} variant="link" as="a">
        {intl.formatMessage({ id: detailLabelIds.button })}
      </Button>
      <DialogRoot open={detailIsOpen} onOpenChange={detailOnClose}>
        <DialogContent>
          <DialogHeader fontSize="xl" fontWeight="semibold">
            {intl.formatMessage({ id: detailLabelIds.modalTitle })}
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            {isLoading ? <Spinner /> : null}
            {activityDetail?.text && !isLoading ? (
              // TODO markdown is not stylized here
              <div
                dangerouslySetInnerHTML={{
                  __html: fromMarkdownToHTML(activityDetail.text) as string,
                }}
              />
            ) : (
              <chakra.div>
                {intl.formatMessage({ id: detailLabelIds.noDetail })}
              </chakra.div>
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </chakra.div>
  );
}

function renderHighlight(content) {
  return <chakra.span color="black">{content}</chakra.span>;
}

function renderLink(link, content) {
  if (isNextUrl(link)) {
    return (
      <Link asChild>
        <NextLink href={link}>{content}</NextLink>
      </Link>
    );
  }

  return <Link href={link}>{content}</Link>;
}

function Activity({ formattedActivity, activity, isBrowser, config }) {
  return (
    <chakra.div color="oaGray.600">
      <div>{formattedActivity}</div>
      <chakra.div visibility={isBrowser ? 'visible' : 'hidden'}>
        <FormattedDate
          value={activity.createdAt}
          dateStyle="long"
          timeStyle="short"
        />
        {config[activity.verb].detailLabelIds ? (
          <ActivityDetail activity={activity} config={config} />
        ) : null}
      </chakra.div>
    </chakra.div>
  );
}

type ActivitiesListProps = {
  emptyElem?: ReactElement;
} & FlexProps;

export function ActivitiesList({
  emptyElem = null,
  ...props
}: ActivitiesListProps) {
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
      {pages.map((page) =>
        page.activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            config={config}
            activity={activity}
            renderHighlight={renderHighlight}
            renderLink={renderLink}
            component={Activity}
          />
        )),
      )}

      {!isLoadingInitialData && !isReachingEnd ? (
        <Button onClick={nextPage} loading={isLoadingMore} m="auto">
          {intl.formatMessage(messages.seeMore)}
        </Button>
      ) : null}
    </Flex>
  );
}
