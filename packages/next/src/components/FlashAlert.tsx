import { useRef, useState, useCallback, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@openagenda/uikit';
import session from '@openagenda/sessions/client';
import { useRouter } from 'next/router';

export default function FlashAlert() {
  const cancelRef = useRef(undefined);
  const [flashMessage, setFlashMessage] = useState(null);
  const router = useRouter();

  const removeMessage = useCallback(
    () => setFlashMessage(null),
    [setFlashMessage],
  );

  // On location change
  useEffect(() => {
    const newMessage = session.flash();
    if (newMessage !== flashMessage) setFlashMessage(newMessage);
  }, [router.asPath]);

  const { isOpen, onClose } = useDisclosure({ isOpen: !!flashMessage });

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogBody pt="6" textAlign="center">
          {flashMessage}
        </AlertDialogBody>
        <AlertDialogFooter justifyContent="center">
          <Button ref={cancelRef} onClick={removeMessage} colorScheme="primary">
            Ok
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
