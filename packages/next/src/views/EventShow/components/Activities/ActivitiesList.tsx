import { ReactElement, useState, useEffect } from 'react';
import { useIntl, FormattedDate } from 'react-intl';
import {
  Button,
  chakra,
  Flex,
  FlexProps,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  Spinner,
  useDisclosure,
} from '@openagenda/uikit';
import ActivityItem from '@openagenda/activity-apps/src/client/components/ActivityItem';
import { fromMarkdownToHTML } from '@openagenda/md';
import isNextUrl from 'utils/isNextUrl';
import NextChakraLink from 'components/NextChakraLink';
import messages from '../../messages';
import { useActivitiesContext } from './context';

function ActivityDetail({ activity, config }) {
  const intl = useIntl();
  const { detailLabelIds } = config[activity.verb];
  const { id: activityId } = activity;
  const {
    isOpen: detailIsOpen,
    onOpen: detailOnOpen,
    onClose: detailOnClose,
  } = useDisclosure({ defaultIsOpen: false });
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
    <chakra.div color="oaGray.500">
      <Button
        onClick={detailOnOpen}
        variant="link"
        colorScheme="primary"
        as="a"
      >
        {intl.formatMessage({ id: detailLabelIds.button })}
      </Button>
      <Modal isOpen={detailIsOpen} onClose={detailOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            sx={{
              ':has(> .chakra-modal__close-btn)': {
                pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
              },
            }}
          >
            {intl.formatMessage({ id: detailLabelIds.modalTitle })}
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody pb="4">
            {isLoading ? <Spinner /> : null}
            {activityDetail?.text && !isLoading ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: fromMarkdownToHTML(activityDetail?.text),
                }}
              />
            ) : (
              <chakra.div>
                {intl.formatMessage({ id: detailLabelIds.noDetail })}
              </chakra.div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </chakra.div>
  );
}

function renderHighlight(content) {
  return <chakra.span color="black">{content}</chakra.span>;
}

function renderLink(link, content) {
  if (isNextUrl(link)) {
    return (
      <NextChakraLink href={link} colorScheme="primary">
        {content}
      </NextChakraLink>
    );
  }

  return (
    <Link href={link} colorScheme="primary">
      {content}
    </Link>
  );
}

function Activity({ formattedActivity, activity, isBrowser, config }) {
  return (
    <chakra.div color="oaGray.500">
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
        <Button onClick={nextPage} isLoading={isLoadingMore} m="auto">
          {intl.formatMessage(messages.seeMore)}
        </Button>
      ) : null}
    </Flex>
  );
}
