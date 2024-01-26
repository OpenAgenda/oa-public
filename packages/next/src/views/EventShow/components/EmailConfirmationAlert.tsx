import { useRef } from 'react';
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

export default function EmailConfirmationAlert({
  isOpen,
  onClose,
  count,
}) {
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
        <AlertDialogHeader>Partager l&apos;événement</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          L&apos;événement a été envoyé à {count} adresse email.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} colorScheme="primary">
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
