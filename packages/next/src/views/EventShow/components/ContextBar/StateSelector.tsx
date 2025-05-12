import { useCallback, useState, useId } from 'react';
import { useIntl } from 'react-intl';
import {
  chakra,
  Button,
  Flex,
  useBreakpointValue,
  Link,
  Text,
} from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Tooltip,
} from '@openagenda/uikit/snippets';
import stateMessages from '@openagenda/common-labels/event/states';
import { nl2br } from '@openagenda/react-shared';
import StateTag from 'components/StateTag';
import { FaIcon } from 'icons';
import { faChevronDown } from 'icons/solid';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import { contextBar as messages } from '../../messages';
import { useInvalidEventModal } from './InvalidEventModal';
import ContextBarButton from './ContextBarButton';
import RejectModal from './RejectModal';

const stateMap = {
  '-1': 'refused',
  0: 'toModerate',
  1: 'readyToPublish',
  2: 'published',
};

function getContributorInfo(intl, state) {
  switch (state) {
    case -1:
      return intl.formatMessage(messages.refusedContributorInfo);
    case 0:
      return intl.formatMessage(messages.toModerateContributorInfo);
    case 1:
      return intl.formatMessage(messages.readyToPublishContributorInfo);
    case 2:
      return intl.formatMessage(messages.publishedContributorInfo);
    default:
      return null;
  }
}

// <chakra.span display={{ base: 'none', md: 'inline-flex' }} verticalAlign="middle" alignItems="center">

export default function StateSelector({
  agenda,
  editLink = '#edit',
  contextBarRef,
}) {
  const intl = useIntl();

  const triggerId = useId();

  const { event, mutate } = useEvent();
  const { me } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const { canChangeState = false, canPublish = false } =
    me?.authorizations ?? {};

  const invalidEventModal = useInvalidEventModal(editLink);

  const [refuseModal, setRefuseModal] = useState(false);

  const changeState = useCallback(
    (state: number, motive: string = null) => {
      const optimisticResponse = {
        success: true,
        event: {
          ...event,
          state,
        },
      };

      mutate(
        async () =>
          fetch(`/api/agendas/${agenda.uid}/events/${event.uid}`, {
            method: 'PATCH',
            body: JSON.stringify({ state, motive }),
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((response) => {
            if (response.ok) {
              return optimisticResponse;
            }
            if (response.status === 400) {
              invalidEventModal.onOpen();
              return;
            }
            throw new Error('Error');
          }),
        {
          optimisticData: optimisticResponse,
          revalidate: false,
        },
      ).catch((e) => {
        console.log('UPDATE STATE ERROR', e);
      });
    },
    [invalidEventModal, event, mutate, agenda],
  );

  const stateLabel = (
    <>
      {intl.formatMessage(messages.state)}
      &nbsp;
      {intl.formatMessage(stateMessages[stateMap[event.state]])}
    </>
  );

  if (!canChangeState) {
    return (
      <MenuRoot
        ids={{ trigger: triggerId }}
        positioning={{
          sameWidth: isMobile,
          gutter: 0,
          overflowPadding: 0,
          fitViewport: true,
          getAnchorRect: isMobile
            ? () => {
                return contextBarRef.current!.getBoundingClientRect();
              }
            : null,
        }}
      >
        <Tooltip
          ids={{ trigger: triggerId }}
          content={stateLabel}
          disabled={!isMobile}
          openDelay={0}
          closeDelay={0}
        >
          <MenuTrigger asChild>
            <ContextBarButton textAlign="start">
              <StateTag
                state={event.state}
                marginEnd={{ base: 'none', md: '0.5rem' }}
              />
              {!isMobile ? (
                <chakra.span flex="1">
                  {intl.formatMessage(messages.state)}
                  &nbsp;
                  {intl.formatMessage(stateMessages[stateMap[event.state]])}
                </chakra.span>
              ) : null}
              <FaIcon icon={faChevronDown} />
            </ContextBarButton>
          </MenuTrigger>
        </Tooltip>

        <MenuContent borderTopRadius="0" maxW="var(--available-width)">
          <div>{getContributorInfo(intl, event.state)}</div>
          {event.state === -1 && event?.motive ? (
            <>
              <Text mt={2}>
                <b>{intl.formatMessage(messages.motive)}:</b>
              </Text>
              <Text>{nl2br(event.motive)}</Text>
            </>
          ) : null}
          <Button asChild mt="4">
            <Link href={`/${agenda.slug}/events/${event.slug}/contact`}>
              {intl.formatMessage(messages.contactAdministrators)}
            </Link>
          </Button>
        </MenuContent>
      </MenuRoot>
    );
  }

  return (
    <MenuRoot
      ids={{ trigger: triggerId }}
      positioning={{
        sameWidth: isMobile,
        gutter: 0,
        overflowPadding: 0,
        fitViewport: true,
        getAnchorRect: isMobile
          ? () => {
              return contextBarRef.current!.getBoundingClientRect();
            }
          : null,
      }}
    >
      <Tooltip
        ids={{ trigger: triggerId }}
        content={stateLabel}
        disabled={!isMobile}
        openDelay={0}
        closeDelay={0}
      >
        <MenuTrigger asChild>
          <ContextBarButton textAlign="start">
            <StateTag state={event.state} />
            <chakra.span flex="1" display={{ base: 'none', md: 'inline' }}>
              {stateLabel}
            </chakra.span>
            <FaIcon icon={faChevronDown} />
          </ContextBarButton>
        </MenuTrigger>
      </Tooltip>

      <MenuContent borderTopRadius="0" maxW="var(--available-width)">
        <MenuItem value="refused" onClick={() => setRefuseModal(true)}>
          <StateTag state="refused" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.refused)}</b>
            {intl.formatMessage(messages.refusedInfo)}
          </Flex>
        </MenuItem>
        <MenuItem value="toControl" onClick={() => changeState(0)}>
          <StateTag state="toControl" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.toModerate)}</b>
            {intl.formatMessage(messages.toModerateInfo)}
          </Flex>
        </MenuItem>
        <MenuItem value="controlled" onClick={() => changeState(1)}>
          <StateTag state="controlled" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.readyToPublish)}</b>
            {intl.formatMessage(messages.readyToPublishInfo)}
          </Flex>
        </MenuItem>
        <MenuItem
          value="published"
          disabled={!canPublish}
          onClick={() => changeState(2)}
        >
          <StateTag state="published" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.published)}</b>
            {intl.formatMessage(messages.publishedInfo)}
          </Flex>
        </MenuItem>
      </MenuContent>

      {invalidEventModal.modal}

      {refuseModal ? (
        <RejectModal
          setRefuseModal={setRefuseModal}
          changeState={(r) => changeState(-1, r)}
        />
      ) : null}
    </MenuRoot>
  );
}
