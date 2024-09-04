import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  ModalFooter,
  Text,
} from '@openagenda/uikit';

export default function NotificationModal({
  onClose,
  title,
  message,
  action,
  onAction,
}) {
  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {title ? (
          <ModalHeader
            sx={{
              ':has(> .chakra-modal__close-btn)': {
                pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
              },
            }}
          >
            {title}
            <ModalCloseButton />
          </ModalHeader>
        ) : null}
        <ModalBody>
          <Text>{message}</Text>
        </ModalBody>
        <ModalFooter justifyContent="center">
          {action ? (
            <Button colorScheme="primary" onClick={onAction}>
              {action}
            </Button>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
