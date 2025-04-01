import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Tooltip,
  useDisclosure,
  useBreakpointValue,
} from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faChevronDown, faEllipsisVertical } from 'icons/solid';
import base64 from 'utils/base64';
import getIsAdminMod from '../../../../utils/isAdminMod';
import { contextBar as messages } from '../../messages';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import DuplicateModal from '../DuplicateModal';
import TransferOwnershipModal from '../TransferOwnershipModal';
import { useInvalidEventModal } from './InvalidEventModal';
import ContextBarButton from './ContextBarButton';
import { fullWidth } from './popperModifiers';

function ButtonMenuItem({
  action,
  description = null,
  onClick,
  disabled = false,
}) {
  return (
    <MenuItem onClick={onClick} isDisabled={disabled}>
      <Flex direction="column">
        <Text fontWeight="bold" display="block">
          {action}
        </Text>
        {description ? <p>{description}</p> : null}
      </Flex>
    </MenuItem>
  );
}

function LinkMenuItem({ action, description, href, rel = null }) {
  return (
    <MenuItem as="a" href={href} rel={rel}>
      <Flex direction="column">
        <Text fontWeight="bold" display="block">
          {action}
        </Text>
        <p>{description}</p>
      </Flex>
    </MenuItem>
  );
}

export default function OtherActions({ agenda }) {
  const intl = useIntl();

  const router = useRouter();

  const { event, mutate } = useEvent();
  const { me, member } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const isAdminMod = getIsAdminMod(me?.member);
  const isEventContributor = member && member.userUid === me?.member?.userUid;
  const isOriginAgenda = event.originAgenda?.uid === agenda.uid;
  const { canEditEvent = false } = me?.authorizations ?? {};

  const invalidEventModal = useInvalidEventModal(
    `/${agenda.slug}/events/${event.slug}/edit`,
  );

  const {
    isOpen: removeIsOpen,
    onOpen: removeOnOpen,
    onClose: removeOnClose,
  } = useDisclosure();

  const {
    isOpen: duplicateIsOpen,
    onOpen: duplicateOnOpen,
    onClose: duplicateOnClose,
  } = useDisclosure();

  const {
    isOpen: transferOwnershipIsOpen,
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

  const onRemove = async () => {
    try {
      const response = await fetch(
        `/api/agendas/${agenda.uid}/events/${event.uid}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        return router.push(`/${agenda.slug}`);
      }
      throw new Error('Error');
    } catch (e) {
      console.log('REMOVE EVENT ERROR', e);
    }
  };

  const displayRemove = isAdminMod || isEventContributor;
  const displayRequestEditionRights = isAdminMod && !canEditEvent;
  const allowTransferOwnership = isAdminMod && canEditEvent;

  const redirectUrl = base64.encode(router.asPath);
  const requestEditionRightsUrl = `/${agenda.slug}/admin/events/${event.slug}/edition-request?redirect=${redirectUrl}`;

  return (
    <>
      <Menu
        matchWidth
        gutter={0}
        modifiers={isMobile ? (fullWidth as any) : null}
      >
        <Tooltip
          label={intl.formatMessage(messages.otherActions)}
          isDisabled={!isMobile}
        >
          <MenuButton
            as={ContextBarButton}
            textAlign={{ base: 'center', md: 'start' }}
            lineHeight="normal"
            display="inline-flex"
            rightIcon={isMobile ? null : <FaIcon icon={faChevronDown} />}
          >
            {isMobile ? (
              <FaIcon icon={faEllipsisVertical} size="lg" />
            ) : (
              <>
                <p>{intl.formatMessage(messages.otherActions)}</p>
                <Text fontSize="sm" mt="1">
                  {intl.formatMessage(messages.otherActionsInfo)}
                </Text>
              </>
            )}
          </MenuButton>
        </Tooltip>
        <MenuList borderTopRadius="0">
          {isAdminMod ? (
            <>
              {event.featured ? (
                <ButtonMenuItem
                  onClick={() => patchEvent({ featured: false })}
                  action={intl.formatMessage(messages.unfeature)}
                  description={intl.formatMessage(messages.featuredInfo)}
                />
              ) : (
                <ButtonMenuItem
                  onClick={() => patchEvent({ featured: true })}
                  action={intl.formatMessage(messages.feature)}
                  description={intl.formatMessage(messages.featuredInfo)}
                />
              )}
              <ButtonMenuItem
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
            onClick={duplicateOnOpen}
            action={intl.formatMessage(messages.duplicate)}
            description={intl.formatMessage(messages.duplicateInfo)}
          />
          {agenda.settings?.lab?.status && canEditEvent ? (
            <>
              <MenuDivider />
              <ButtonMenuItem
                onClick={() => patchEvent({ status: 1 })}
                action={intl.formatMessage(messages.clearStatus)}
                description={intl.formatMessage(messages.clearStatusInfo)}
              />
              <ButtonMenuItem
                onClick={() => patchEvent({ status: 2 })}
                action={intl.formatMessage(messages.markAsRescheduled)}
                description={intl.formatMessage(messages.markAsRescheduledInfo)}
              />
              <ButtonMenuItem
                onClick={() => patchEvent({ status: 3 })}
                action={intl.formatMessage(messages.markAsMovedOnline)}
                description={intl.formatMessage(
                  messages.markAsMovedOnlineStatus,
                )}
              />
              <ButtonMenuItem
                onClick={() => patchEvent({ status: 4 })}
                action={intl.formatMessage(messages.markAsPostponed)}
                description={intl.formatMessage(messages.markAsPostponedStatus)}
              />
              <ButtonMenuItem
                onClick={() => patchEvent({ status: 5 })}
                action={intl.formatMessage(messages.markAsFull)}
                description={intl.formatMessage(messages.markAsFullStatus)}
              />
              <ButtonMenuItem
                onClick={() => patchEvent({ status: 6 })}
                action={intl.formatMessage(messages.markAsCancelled)}
                description={intl.formatMessage(messages.markAsCancelledStatus)}
              />
            </>
          ) : null}
          {displayRemove || displayRequestEditionRights ? (
            <MenuDivider />
          ) : null}
          {displayRequestEditionRights ? (
            <LinkMenuItem
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
                  onClick={removeOnOpen}
                  action={intl.formatMessage(messages.deleteEvent)}
                  description={intl.formatMessage(messages.deleteEventInfo)}
                />
              ) : (
                <ButtonMenuItem
                  onClick={removeOnOpen}
                  action={intl.formatMessage(messages.removeEvent)}
                  description={intl.formatMessage(messages.removeEventInfo)}
                />
              )}
            </>
          ) : null}
        </MenuList>
      </Menu>

      <Modal isOpen={removeIsOpen} onClose={removeOnClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody m="auto">
            {isOriginAgenda
              ? intl.formatMessage(messages.deleteConfirmation)
              : intl.formatMessage(messages.removeConfirmation)}
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="danger" mr={3} onClick={onRemove}>
              {isOriginAgenda
                ? intl.formatMessage(messages.delete)
                : intl.formatMessage(messages.remove)}
            </Button>
            <Button variant="ghost" onClick={removeOnClose}>
              {intl.formatMessage(messages.cancel)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
