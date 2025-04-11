import { useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Tabs } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
} from '@openagenda/uikit/snippets';
import { FetchStatus } from 'config/types';
import useUser from 'hooks/useUser';
import ModalLoadingBody from 'components/ModalLoadingBody';
import { shareModal as messages } from '../../messages';
import ShareOnOA from './ShareOnOA';
import UnloggedBody from './UnloggedBody';
import OtherShares from './OtherShares';

function ShareModalBody({
  dialogRef,
  agenda,
  event,
  contentLocale,
  onClose,
  onEmailSent,
}) {
  const intl = useIntl();
  const { user } = useUser();

  return (
    <DialogBody px="0">
      <Tabs.Root lazyMount defaultValue="oa" fitted justify="center">
        {event.state === 2 ? (
          <Tabs.List>
            <Tabs.Trigger value="oa">
              {intl.formatMessage(messages.onOA)}
            </Tabs.Trigger>
            <Tabs.Trigger value="others">
              {intl.formatMessage(messages.others)}
            </Tabs.Trigger>
          </Tabs.List>
        ) : null}
        <Tabs.Content value="oa" px="4">
          {user ? (
            <ShareOnOA agenda={agenda} event={event} />
          ) : (
            <UnloggedBody />
          )}
        </Tabs.Content>
        <Tabs.Content value="others" px="4">
          <OtherShares
            dialogRef={dialogRef}
            contentLocale={contentLocale}
            onClose={onClose}
            onEmailSent={onEmailSent}
          />
        </Tabs.Content>
      </Tabs.Root>
    </DialogBody>
  );
}

export default function ShareModal({
  isOpen,
  onClose: originalOnClose,
  agenda,
  event,
  contentLocale,
  onEmailSent,
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
    <DialogRoot
      size="md"
      // isCentered
      // scrollBehavior="inside"
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent ref={dialogRef}>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.share)}
        </DialogHeader>
        <DialogCloseTrigger />

        {status === FetchStatus.Fetching ? (
          <ModalLoadingBody />
        ) : (
          <ShareModalBody
            dialogRef={dialogRef}
            agenda={agenda}
            event={event}
            contentLocale={contentLocale}
            onClose={onClose}
            onEmailSent={onEmailSent}
          />
        )}
      </DialogContent>
    </DialogRoot>
  );
}
