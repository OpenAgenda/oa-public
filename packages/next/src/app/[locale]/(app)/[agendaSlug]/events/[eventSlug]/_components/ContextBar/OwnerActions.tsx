'use client';

import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';
import { chakra, Flex, Text, useDisclosure } from '@openagenda/uikit';
import { contextBar as messages } from '../../messages';
import { useAgenda } from '../../_context/agenda';
import useEvent from '../../_hooks/useEvent';
import useMember from '../../_hooks/useMember';
import DuplicateModal from '../DuplicateModal';
import ContextBarButton from './ContextBarButton';
import RemoveEventModal from './RemoveEventModal';

const Cell = chakra('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    bg: 'primary.500',
    h: '50px',
    flex: '1',
  },
});

// Minimal context bar shown to a user who owns the event but is no longer a
// contributor/adminmod of its agenda. Direct buttons (no "other actions" menu)
// since there are only one or two relevant actions.
export default function OwnerActions() {
  const intl = useIntl();
  const router = useRouter();

  const agenda = useAgenda();
  const { event } = useEvent();
  const { me } = useMember();

  const {
    open: duplicateIsOpen,
    onOpen: duplicateOnOpen,
    onClose: duplicateOnClose,
  } = useDisclosure();
  const {
    open: removeIsOpen,
    onOpen: removeOnOpen,
    onClose: removeOnClose,
  } = useDisclosure();

  const isOriginAgenda = event.originAgenda?.uid === agenda.uid;
  const { canDeleteEvent = false } = me?.authorizations ?? {};
  const displayDelete = isOriginAgenda && !!canDeleteEvent;

  return (
    <>
      <Flex bg="white" gap="1px">
        <Cell>
          <ContextBarButton justifyContent="center" onClick={duplicateOnOpen}>
            <Text fontWeight="bold">
              {intl.formatMessage(messages.duplicate)}
            </Text>
          </ContextBarButton>
        </Cell>
        {displayDelete ? (
          <Cell>
            <ContextBarButton justifyContent="center" onClick={removeOnOpen}>
              <Text fontWeight="bold">
                {intl.formatMessage(messages.deleteEvent)}
              </Text>
            </ContextBarButton>
          </Cell>
        ) : null}
      </Flex>

      <DuplicateModal
        isOpen={duplicateIsOpen}
        onClose={duplicateOnClose}
        agenda={agenda}
        event={event}
      />

      <RemoveEventModal
        isOpen={removeIsOpen}
        onClose={removeOnClose}
        agendaUid={agenda.uid}
        eventUid={event.uid}
        isOriginAgenda={isOriginAgenda}
        onCompleted={() => router.push(`/${agenda.slug}`)}
      />
    </>
  );
}
