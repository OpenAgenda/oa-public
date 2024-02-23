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
  useDisclosure, useBreakpointValue,
} from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faChevronDown, faEllipsisVertical } from 'icons/solid';
import { contextBar as messages } from '../../messages';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import DuplicateModal from '../DuplicateModal';
import ContextBarButton from './ContextBarButton';
import { fullWidth } from './popperModifiers';

function ActionMenuItem({ action, description, onClick }) {
  return (
    <MenuItem onClick={onClick}>
      <Flex direction="column">
        <Text fontWeight="bold" display="block">{action}</Text>
        <p>{description}</p>
      </Flex>
    </MenuItem>
  );
}

export default function OtherActions({ agenda }) {
  const intl = useIntl();

  const router = useRouter();

  const { event, mutate } = useEvent();
  const { me } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const isAdminMod = me?.member?.role === 'administrator' || me?.member?.role === 'moderator';
  const { canEditEvent = false } = me?.authorizations ?? {};

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

  const isOriginAgenda = event.originAgenda?.uid === agenda.uid;

  const patchEvent = async data => {
    try {
      const optimisticResponse = {
        success: true,
        event: {
          ...event,
          ...data,
        },
      };

      await mutate(async () => {
        const response = await fetch(`/api/agendas/${agenda.uid}/events/${event.uid}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) return optimisticResponse;
        throw new Error('Error');
      }, {
        optimisticData: optimisticResponse,
        revalidate: false,
      });
    } catch (e) {
      console.log('PATCH EVENT ERROR', e);
    }
  };

  const onRemove = async () => {
    try {
      const response = await fetch(`/api/agendas/${agenda.uid}/events/${event.uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return router.push(`/${agenda.slug}`);
      }
      throw new Error('Error');
    } catch (e) {
      console.log('REMOVE EVENT ERROR', e);
    }
  };

  // if (!isAdminMod && !canEditEvent) {
  //   return null;
  // }

  return (
    <>
      <Menu
        matchWidth
        gutter={0}
        modifiers={isMobile ? fullWidth as any : null}
      >
        <Tooltip label={intl.formatMessage(messages.otherActions)} isDisabled={!isMobile}>
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
                <ActionMenuItem
                  onClick={() => patchEvent({ featured: false })}
                  action={intl.formatMessage(messages.feature)}
                  description={intl.formatMessage(messages.featuredInfo)}
                />
              ) : (
                <ActionMenuItem
                  onClick={() => patchEvent({ featured: true })}
                  action={intl.formatMessage(messages.unfeature)}
                  description={intl.formatMessage(messages.featuredInfo)}
                />
              )}
            </>
          ) : null}
          <ActionMenuItem
            onClick={duplicateOnOpen}
            action={intl.formatMessage(messages.duplicate)}
            description={intl.formatMessage(messages.duplicateInfo)}
          />
          {agenda.settings?.lab?.status && canEditEvent ? (
            <>
              <MenuDivider />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 1 })}
                action={intl.formatMessage(messages.clearStatus)}
                description={intl.formatMessage(messages.clearStatusInfo)}
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 2 })}
                action={intl.formatMessage(messages.markAsRescheduled)}
                description={intl.formatMessage(messages.markAsRescheduledInfo)}
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 3 })}
                action={intl.formatMessage(messages.markAsMovedOnline)}
                description={intl.formatMessage(messages.markAsMovedOnlineStatus)}
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 4 })}
                action={intl.formatMessage(messages.markAsPostponed)}
                description={intl.formatMessage(messages.markAsPostponedStatus)}
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 5 })}
                action={intl.formatMessage(messages.markAsFull)}
                description={intl.formatMessage(messages.markAsFullStatus)}
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 6 })}
                action={intl.formatMessage(messages.markAsCancelled)}
                description={intl.formatMessage(messages.markAsCancelledStatus)}
              />
            </>
          ) : null}
          <MenuDivider />
          {/* TODO adminMod or event editor can delete/remove */}
          {isOriginAgenda ? (
            <ActionMenuItem
              onClick={removeOnOpen}
              action={intl.formatMessage(messages.deleteEvent)}
              description={intl.formatMessage(messages.deleteEventInfo)}
            />
          ) : (
            <ActionMenuItem
              onClick={removeOnOpen}
              action={intl.formatMessage(messages.removeEvent)}
              description={intl.formatMessage(messages.removeEventInfo)}
            />
          )}
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
        <DuplicateModal isOpen onClose={duplicateOnClose} agenda={agenda} event={event} />
      ) : null}
    </>
  );
}
