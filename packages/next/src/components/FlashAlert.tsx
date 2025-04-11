import { useRef, useState, useCallback, useEffect } from 'react';
import { Button, useDisclosure } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import session from '@openagenda/sessions/client';
import { useRouter } from 'next/router';

export default function FlashAlert() {
  const cancelRef = useRef<HTMLButtonElement>(null);
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

  const { open, onClose } = useDisclosure({ open: !!flashMessage });

  return (
    <DialogRoot
      role="alertdialog"
      open={open}
      onOpenChange={onClose}
      initialFocusEl={() => cancelRef.current}
      placement="center"
    >
      <DialogContent>
        <DialogBody pt="6" textAlign="center">
          {flashMessage}
        </DialogBody>
        <DialogFooter justifyContent="center">
          <Button ref={cancelRef} onClick={removeMessage}>
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
