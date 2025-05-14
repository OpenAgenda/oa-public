import { useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import { Agenda } from 'types';
import Body from './Body';
import messages from './messages';

interface ExportModalProps {
  agenda: Agenda;
  isOpen: boolean;
  onClose: () => void;
  defaultValue?: string | string[];
}

export default function ExportModal({
  isOpen,
  onClose,
  agenda,
  defaultValue = null,
}: ExportModalProps) {
  const intl = useIntl();

  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={dialogRef}>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.modalTitle)}
        </DialogHeader>
        <DialogCloseTrigger />
        <Body
          dialogRef={dialogRef}
          agenda={agenda}
          onClose={onClose}
          defaultValue={defaultValue}
        />
      </DialogContent>
    </DialogRoot>
  );
}
