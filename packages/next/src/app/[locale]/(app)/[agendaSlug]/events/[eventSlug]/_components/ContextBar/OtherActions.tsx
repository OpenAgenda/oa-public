'use client';

import { useId } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import {
  Text,
  Flex,
  useDisclosure,
  useBreakpointValue,
} from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  Tooltip,
} from '@openagenda/uikit/snippets';
import { FaIcon } from '@/src/icons';
import { faChevronDown, faEllipsisVertical } from '@/src/icons/solid';
import base64 from '@/src/utils/base64';
import getIsAdminMod from '@/src/utils/isAdminMod';
import { contextBar as messages } from '../../messages';
import useEvent from '../../_hooks/useEvent';
import useMember from '../../_hooks/useMember';
import DuplicateModal from '../DuplicateModal';
import TransferOwnershipModal from '../TransferOwnershipModal';
import { useInvalidEventModal } from './InvalidEventModal';
import ContextBarButton from './ContextBarButton';
import RemoveEventModal from './RemoveEventModal';

function ButtonMenuItem({
  value,
  action,
  description = null,
  onClick,
  disabled = false,
}) {
  return (
    <MenuItem value={value} onClick={onClick} disabled={disabled}>
      <Flex direction="column">
        <Text fontWeight="bold" display="block">
          {action}
        </Text>
        {description ? <p>{description}</p> : null}
      </Flex>
    </MenuItem>
  );
}

function LinkMenuItem({ value, action, description, href, rel = null }) {
  return (
    <MenuItem value={value} asChild>
      <a href={href} rel={rel}>
        <Flex direction="column">
          <Text fontWeight="bold" display="block">
            {action}
          </Text>
          <p>{description}</p>
        </Flex>
      </a>
    </MenuItem>
  );
}

export default function OtherActions({ agenda, editLink, contextBarRef }) {
  const intl = useIntl();

  const triggerId = useId();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { event, mutate } = useEvent();
  const { me, member } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const isAdminMod = getIsAdminMod(me?.member);
  const isEventContributor = member && member.userUid === me?.member?.userUid;
  const isOriginAgenda = event.originAgenda?.uid === agenda.uid;
  const { canEditEvent = false } = me?.authorizations ?? {};
  const enabledStatuses = agenda.settings?.contribution?.status?.enabled || [
    2, 5, 6,
  ];

  const invalidEventModal = useInvalidEventModal(editLink);

  const {
    open: removeIsOpen,
    onOpen: removeOnOpen,
    onClose: removeOnClose,
  } = useDisclosure();

  const {
    open: duplicateIsOpen,
    onOpen: duplicateOnOpen,
    onClose: duplicateOnClose,
  } = useDisclosure();

  const {
    open: transferOwnershipIsOpen,
    onOpen: transferOwnershipOnOpen,
    onClose: transferOwnershipOnClose,
  } = useDisclosure();

  const patchEvent = async (data) => {
    try {
      const optimisticResponse = {
        success: true,
        event: {
          ...event,
          ...data,
        },
      };

      await mutate(
        async () => {
          const response = await fetch(
            `/api/agendas/${agenda.uid}/events/${event.uid}`,
            {
              method: 'PATCH',
              body: JSON.stringify(data),
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          if (response.ok) return optimisticResponse;
          if (response.status === 400) {
            invalidEventModal.onOpen();
            return;
          }
          throw new Error('Error');
        },
        {
          optimisticData: optimisticResponse,
          revalidate: false,
        },
      );
    } catch (e) {
      console.log('PATCH EVENT ERROR', e);
    }
  };

  const displayRemove = isAdminMod || isEventContributor;
  const displayRequestEditionRights = isAdminMod && !canEditEvent;
  const allowTransferOwnership = isAdminMod && canEditEvent;

  const search = searchParams.toString();
  const redirectUrl = base64.encode(
    search ? `${pathname}?${search}` : pathname,
  );
  const requestEditionRightsUrl = `/${agenda.slug}/admin/events/${event.slug}/edition-request?redirect=${redirectUrl}`;

  return (
    <>
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
          content={intl.formatMessage(messages.otherActions)}
          disabled={!isMobile}
          openDelay={0}
          closeDelay={0}
        >
          <MenuTrigger asChild>
            <ContextBarButton
              textAlign={{ base: 'center', md: 'start' }}
              lineHeight="normal"
              display="inline-flex"
              justifyContent="center"
            >
              {isMobile ? (
                <FaIcon icon={faEllipsisVertical} size="lg" />
              ) : (
                <Flex direction="column" flex="1">
                  <p>{intl.formatMessage(messages.otherActions)}</p>
                  <Text fontSize="xs" mt="1">
                    {intl.formatMessage(messages.otherActionsInfo)}
                  </Text>
                </Flex>
              )}
              {isMobile ? null : <FaIcon icon={faChevronDown} />}
            </ContextBarButton>
          </MenuTrigger>
        </Tooltip>

        <MenuContent borderTopRadius="0" maxW="var(--available-width)">
          {isAdminMod ? (
            <>
              {event.featured ? (
                <ButtonMenuItem
                  value="feature"
                  onClick={() => patchEvent({ featured: false })}
                  action={intl.formatMessage(messages.unfeature)}
                  description={intl.formatMessage(messages.featuredInfo)}
                />
              ) : (
                <ButtonMenuItem
                  value="unfeature"
                  onClick={() => patchEvent({ featured: true })}
                  action={intl.formatMessage(messages.feature)}
                  description={intl.formatMessage(messages.featuredInfo)}
                />
              )}
              <ButtonMenuItem
                value="transfer-ownership"
                disabled={!allowTransferOwnership}
                onClick={transferOwnershipOnOpen}
                action={intl.formatMessage(messages.transferOwnership)}
                description={intl.formatMessage(
                  messages[
                    allowTransferOwnership
                      ? 'transferOwnershipDescription'
                      : 'transferOwnershipDescriptionDisabled'
                  ],
                )}
              />
            </>
          ) : null}
          <ButtonMenuItem
            value="duplicate"
            onClick={duplicateOnOpen}
            action={intl.formatMessage(messages.duplicate)}
            description={intl.formatMessage(messages.duplicateInfo)}
          />
          {canEditEvent ? (
            <>
              <MenuSeparator />
              <ButtonMenuItem
                value="clear-status"
                onClick={() => patchEvent({ status: 1 })}
                action={intl.formatMessage(messages.clearStatus)}
                description={intl.formatMessage(messages.clearStatusInfo)}
              />
              {enabledStatuses.includes(2) ? (
                <ButtonMenuItem
                  value="mark-as-rescheduled"
                  onClick={() => patchEvent({ status: 2 })}
                  action={intl.formatMessage(messages.markAsRescheduled)}
                  description={intl.formatMessage(
                    messages.markAsRescheduledInfo,
                  )}
                />
              ) : null}
              {enabledStatuses.includes(3) ? (
                <ButtonMenuItem
                  value="mark-as-moved-online"
                  onClick={() => patchEvent({ status: 3 })}
                  action={intl.formatMessage(messages.markAsMovedOnline)}
                  description={intl.formatMessage(
                    messages.markAsMovedOnlineStatus,
                  )}
                />
              ) : null}
              {enabledStatuses.includes(4) ? (
                <ButtonMenuItem
                  value="mark-as-postponed"
                  onClick={() => patchEvent({ status: 4 })}
                  action={intl.formatMessage(messages.markAsPostponed)}
                  description={intl.formatMessage(
                    messages.markAsPostponedStatus,
                  )}
                />
              ) : null}
              {enabledStatuses.includes(5) ? (
                <ButtonMenuItem
                  value="mark-as-full"
                  onClick={() => patchEvent({ status: 5 })}
                  action={intl.formatMessage(messages.markAsFull)}
                  description={intl.formatMessage(messages.markAsFullStatus)}
                />
              ) : null}
              {enabledStatuses.includes(6) ? (
                <ButtonMenuItem
                  value="mark-as-cancelled"
                  onClick={() => patchEvent({ status: 6 })}
                  action={intl.formatMessage(messages.markAsCancelled)}
                  description={intl.formatMessage(
                    messages.markAsCancelledStatus,
                  )}
                />
              ) : null}
            </>
          ) : null}
          {displayRemove || displayRequestEditionRights ? (
            <MenuSeparator />
          ) : null}
          {displayRequestEditionRights ? (
            <LinkMenuItem
              value="request-edition-rights"
              href={requestEditionRightsUrl}
              rel="nofollow"
              action={intl.formatMessage(messages.requestEditionRights)}
              description={intl.formatMessage(
                messages.requestEditionRightsInfo,
              )}
            />
          ) : null}
          {displayRemove ? (
            <>
              {isOriginAgenda ? (
                <ButtonMenuItem
                  value="delete-event"
                  onClick={removeOnOpen}
                  action={intl.formatMessage(messages.deleteEvent)}
                  description={intl.formatMessage(messages.deleteEventInfo)}
                />
              ) : (
                <ButtonMenuItem
                  value="remove-event"
                  onClick={removeOnOpen}
                  action={intl.formatMessage(messages.removeEvent)}
                  description={intl.formatMessage(messages.removeEventInfo)}
                />
              )}
            </>
          ) : null}
        </MenuContent>
      </MenuRoot>

      <RemoveEventModal
        isOpen={removeIsOpen}
        onClose={removeOnClose}
        agendaUid={agenda.uid}
        eventUid={event.uid}
        isOriginAgenda={isOriginAgenda}
        onCompleted={() => router.push(`/${agenda.slug}`)}
      />

      {duplicateIsOpen ? (
        <DuplicateModal
          isOpen
          onClose={duplicateOnClose}
          agenda={agenda}
          event={event}
        />
      ) : null}

      {transferOwnershipIsOpen ? (
        <TransferOwnershipModal isOpen onClose={transferOwnershipOnClose} />
      ) : null}
      {invalidEventModal.modal}
    </>
  );
}
