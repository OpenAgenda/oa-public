'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Button, useDisclosure } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import session from '@openagenda/sessions/client';
import { usePathname } from 'next/navigation';

export default function AppFlashAlert() {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [flashMessage, setFlashMessage] = useState(null);
  const pathname = usePathname();

  const removeMessage = useCallback(
    () => setFlashMessage(null),
    [setFlashMessage],
  );

  useEffect(() => {
    const newMessage = session.flash();
    if (newMessage !== flashMessage) setFlashMessage(newMessage);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
