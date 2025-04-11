import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import { emailConfirmationAlert as messages } from '../messages';

export default function EmailConfirmationAlert({ isOpen, onClose, count }) {
  const intl = useIntl();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogRoot
      role="alertdialog"
      open={isOpen}
      onOpenChange={onClose}
      initialFocusEl={() => cancelRef.current}
      placement="center"
    >
      <DialogContent>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.shareEvent)}
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          {intl.formatMessage(messages.shareEventInfo, { count })}
        </DialogBody>
        <DialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            {intl.formatMessage(messages.close)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
