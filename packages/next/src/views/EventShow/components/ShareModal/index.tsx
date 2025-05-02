import { useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import { FetchStatus } from 'config/types';
import useUser from 'hooks/useUser';
import ModalLoadingBody from 'components/ModalLoadingBody';
import { shareModal as messages } from '../../messages';
import Body from './Body';

export default function ShareModal({
  isOpen,
  onClose: originalOnClose,
  agenda,
  event,
  contentLocale,
  onEmailSent,
  defaultValue = null,
  children = null,
}) {
  const intl = useIntl();
  const router = useRouter();
  const { status } = useUser();

  const dialogRef = useRef<HTMLDivElement>(null);

  // Remove sharemodal=1 from url
  const onClose = useCallback(() => {
    const url = new URL(router.asPath, 'https://n');

    url.searchParams.delete('sharemodal');

    router.replace(url.pathname + url.search, null, { shallow: true });
    originalOnClose();
  }, [originalOnClose, router]);

  return (
    <DialogRoot size="md" open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={dialogRef}>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.shareEvent)}
        </DialogHeader>
        <DialogCloseTrigger />

        {status === FetchStatus.Fetching ? (
          <ModalLoadingBody />
        ) : (
          <Body
            dialogRef={dialogRef}
            agenda={agenda}
            event={event}
            contentLocale={contentLocale}
            onClose={onClose}
            onEmailSent={onEmailSent}
            defaultValue={defaultValue}
          >
            {children}
          </Body>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
