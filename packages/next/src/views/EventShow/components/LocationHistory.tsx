import { useIntl } from 'react-intl';
import {
  Button, Center,
  Modal, ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@openagenda/uikit';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';
import useMember from '../hooks/useMember';
import { locationHistory as messages } from '../messages';
import { Activities, ActivitiesList } from './Activities';

export default function LocationHistory() {
  const intl = useIntl();
  const agenda = useAgenda();
  const { event } = useEvent();

  const { me } = useMember();
  const { canEditEvent = false } = me?.authorizations ?? {};

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  if (!canEditEvent) {
    return null;
  }

  return (
    <>
      <Button
        onClick={onOpen}
        alignSelf="start"
        variant="outline"
        borderColor="oaGray.300"
        color="blackAlpha.800"
        _hover={{
          bg: 'oaGray.100',
          color: 'blackAlpha.900',
          textDecoration: 'none',
        }}
      >
        {intl.formatMessage(messages.showHistory)}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            sx={{
              ':has(> .chakra-modal__close-btn)': {
                pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
              },
            }}
          >
            {intl.formatMessage(messages.locationHistory)}
            <ModalCloseButton />
          </ModalHeader>

          <ModalBody>
            <Activities res={`/api/agendas/${agenda.uid}/locations/${event.location.uid}/activities`}>
              <ActivitiesList
                emptyElem={(
                  <Center py="12">
                    {intl.formatMessage(messages.noActivity)}
                  </Center>
                )}
              />
            </Activities>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
