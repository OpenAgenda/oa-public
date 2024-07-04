import { useIntl } from 'react-intl';
import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@openagenda/uikit';
import Body from './Body';
import messages from './messages';

interface ExportModalProps {
  agendaUid: number;
  agendaTitle: string;
  isOpen: boolean;
  onClose: () => void;
  defaultIndex?: number | number[];
}

export default function ExportModal({
  isOpen,
  onClose,
  agendaUid,
  agendaTitle,
  defaultIndex = null,
}: ExportModalProps) {
  const intl = useIntl();

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          sx={{
            ':has(> .chakra-modal__close-btn)': {
              pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
            },
          }}
        >
          {intl.formatMessage(messages.modalTitle)}
          <ModalCloseButton />
        </ModalHeader>
        <Body agendaUid={agendaUid} agendaTitle={agendaTitle} onClose={onClose} defaultIndex={defaultIndex} />
      </ModalContent>
    </Modal>
  );
}
