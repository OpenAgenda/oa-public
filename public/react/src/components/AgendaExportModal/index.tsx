import { useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import { Agenda } from '../../types';
import Body from './Body';
import messages from './messages';

interface ExportModalProps {
  agenda: Agenda;
  query: any;
  isOpen: boolean;
  onClose: () => void;
  defaultValue?: string | string[];
  rootUrl?: string;
  apiRootUrl?: string;
  renderHost?: 'local' | 'parent';
  fetchAgendaExportSettings?: ({ agendaUid }) => Promise<any>;
  portalRef?: React.RefObject<HTMLElement>;
}

export default function AgendaExportModal({
  isOpen,
  onClose,
  agenda,
  query,
  defaultValue = [],
  rootUrl = 'https://openagenda.com',
  apiRootUrl = 'https://api.openagenda.com',
  renderHost = 'local',
  fetchAgendaExportSettings = null,
  portalRef,
}: ExportModalProps) {
  const intl = useIntl();

  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={onClose}
      onInteractOutside={(e) => {
        const evt = e.detail.originalEvent as FocusEvent;
        const originalTarget = evt.target as HTMLElement | null;
        const target = e.target as HTMLElement | null;
        const rootNode = target?.getRootNode() as ShadowRoot | undefined;
        if (e.type === 'focus.outside' && originalTarget === rootNode?.host) {
          e.preventDefault();
        }
      }}
    >
      <DialogContent ref={dialogRef} portalRef={portalRef}>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.modalTitle)}
        </DialogHeader>
        <DialogCloseTrigger />
        <Body
          dialogRef={dialogRef}
          agenda={agenda}
          query={query}
          onClose={onClose}
          defaultValue={defaultValue}
          rootUrl={rootUrl}
          apiRootUrl={apiRootUrl}
          renderHost={renderHost}
          fetchAgendaExportSettings={fetchAgendaExportSettings}
        />
      </DialogContent>
    </DialogRoot>
  );
}
