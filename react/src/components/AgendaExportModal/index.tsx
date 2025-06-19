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
  user?: any;
  agenda: Agenda;
  query: any;
  isOpen: boolean;
  onClose: () => void;
  defaultValue?: string | string[];
  rootUrl?: string;
  apiRootUrl?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  user = null,
  agenda,
  query,
  defaultValue = [],
  rootUrl = 'https://openagenda.com',
  apiRootUrl = 'https://api.openagenda.com',
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
          user={user}
          agenda={agenda}
          query={query}
          onClose={onClose}
          defaultValue={defaultValue}
          rootUrl={rootUrl}
          apiRootUrl={apiRootUrl}
        />
      </DialogContent>
    </DialogRoot>
  );
}
