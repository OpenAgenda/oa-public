import { useRouter } from 'next/router';
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
  useDisclosure,
} from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faChevronDown } from 'icons/solid';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import DuplicateModal from '../DuplicateModal';
import ContextBarButton from './ContextBarButton';

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
  const router = useRouter();

  const { event, mutate } = useEvent();
  const { member, authorizations } = useMember();

  const isAdminMod = member?.role === 'administrator' || member?.role === 'moderator';
  const {
    canEditEvent = false,
    canPublish = false,
  } = authorizations ?? {};

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

  const isOriginAgenda = event.originAgenda.uid === agenda.uid;

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
      <Menu matchWidth gutter={0}>
        <MenuButton
          as={ContextBarButton}
          textAlign="start"
          lineHeight="normal"
          display="inline-flex"
          rightIcon={<FaIcon icon={faChevronDown} />}
        >
          <p>Autres actions</p>
          <Text fontSize="sm" mt="1">Mise en une, annulation, report, duplication...</Text>
        </MenuButton>
        <MenuList borderTopRadius="0">
          {isAdminMod ? (
            <>
              {event.featured ? (
                <ActionMenuItem
                  onClick={() => patchEvent({ featured: false })}
                  action="Mettre en une"
                  description="Un événement en une apparait en tête de liste"
                />
              ) : (
                <ActionMenuItem
                  onClick={() => patchEvent({ featured: true })}
                  action="Retirer de la une"
                  description="Un événement en une apparait en tête de liste"
                />
              )}
            </>
          ) : null}
          <ActionMenuItem
            onClick={duplicateOnOpen}
            action="Dupliquer"
            description="Charger un nouveau formulaire de saisie pré-rempli avec les informations de cet événement"
          />
          {agenda.settings?.lab?.status && canEditEvent ? (
            <>
              <MenuDivider />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 1 })}
                action="Réinitialiser l'état de l'événement"
                description="L'événement n'est pas annulé, ni reprogrammé, etc…"
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 2 })}
                action="L'événement a été reprogrammé"
                description="Les dates et/ou horaires de l'événement ont été modifiées"
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 3 })}
                action="L'événement a lieu en ligne"
                description="La participation de l'événement n'est désormais plus possible en présentiel"
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 4 })}
                action="L'événement est reporté"
                description="L'événement a été reporté à des dates encore non connues"
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 5 })}
                action="L'événement est complet"
                description="L'événement n'accepte plus de nouveaux participants"
              />
              <ActionMenuItem
                onClick={() => patchEvent({ status: 6 })}
                action="L'événement est annulé"
                description="L'événement a été annulé de manière permanente"
              />
            </>
          ) : null}
          <MenuDivider />
          {/* TODO adminMod or event editor can delete/remove */}
          {isOriginAgenda ? (
            <ActionMenuItem
              onClick={removeOnOpen}
              action="Supprimer l'événement"
              description="Supprimer de manière permanente l'événement d'OpenAgenda"
            />
          ) : (
            <ActionMenuItem
              onClick={removeOnOpen}
              action="Retirer l'événement"
              description="L'événement ne sera plus référencé sur l'agenda"
            />
          )}
        </MenuList>
      </Menu>

      <Modal isOpen={removeIsOpen} onClose={removeOnClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody m="auto">
            Etes-vous sûr de vouloir supprimer cet événement?
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="danger" mr={3} onClick={onRemove}>
              Confirmer
            </Button>
            <Button variant="ghost" onClick={removeOnClose}>
              Annuler
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
