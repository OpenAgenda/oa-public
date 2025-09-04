import { useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import messages from './messages';
import Body from './Body';

export default function EventShareModal({
  isOpen,
  onClose,
  agenda,
  event,
  user = null,
  contentLocale,
  onEmailSent,
  defaultValue = null,
  children = null,
  rootUrl = 'https://openagenda.com',
  renderHost = 'local',
}) {
  const intl = useIntl();

  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <DialogRoot
      size="md"
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
      <DialogContent ref={dialogRef}>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.shareEvent)}
        </DialogHeader>
        <DialogCloseTrigger />

        <Body
          dialogRef={dialogRef}
          agenda={agenda}
          event={event}
          user={user}
          contentLocale={contentLocale}
          onClose={onClose}
          onEmailSent={onEmailSent}
          defaultValue={defaultValue}
          rootUrl={rootUrl}
          renderHost={renderHost}
        >
          {children}
        </Body>
      </DialogContent>
    </DialogRoot>
  );
}
