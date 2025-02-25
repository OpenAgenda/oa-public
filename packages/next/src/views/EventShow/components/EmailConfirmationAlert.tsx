import { useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@openagenda/uikit';
import { emailConfirmationAlert as messages } from '../messages';

export default function EmailConfirmationAlert({ isOpen, onClose, count }) {
  const intl = useIntl();
  const cancelRef = useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>
          {intl.formatMessage(messages.shareEvent)}
        </AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          {intl.formatMessage(messages.shareEventInfo, { count })}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} colorScheme="primary">
            {intl.formatMessage(messages.close)}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
