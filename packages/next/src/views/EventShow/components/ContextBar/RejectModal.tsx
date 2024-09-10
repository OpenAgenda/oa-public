import { useIntl } from 'react-intl';
import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  Text,
  Button,
} from '@openagenda/uikit';
import { rejectModal as messages } from '../../messages';

export default function RejectModal({ setRefuseModal, changeState }) {
  const intl = useIntl();
  const [motive, setMotive] = useState('');

  return (
    <Modal isOpen onClose={() => setRefuseModal(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          sx={{
            ':has(> .chakra-modal__close-btn)': {
              pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
            },
          }}
        >
          {intl.formatMessage(messages.confirmRejection)}
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <b>{intl.formatMessage(messages.motive)}</b>
          <Text pb={2}>{intl.formatMessage(messages.motiveInfo)}</Text>
          <Textarea
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            placeholder={intl.formatMessage(messages.motivePlaceholder)}
          />
          <ModalFooter justifyContent="center">
            <Button
              colorScheme="primary"
              onClick={() => {
                changeState(motive);
                setRefuseModal(false);
              }}
            >
              {intl.formatMessage(messages.confirm)}
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
