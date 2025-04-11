import { useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';
import ModalLoadingBody from 'components/ModalLoadingBody';
import UnloggedBody from './UnloggedBody';
import LoggedBody from './LoggedBody';
import messages from './messages';

interface AggregateModalProps {
  isOpen: boolean;
  onClose: () => void;
  agenda: Record<string, any>;
}

function AggregateModalBody({ agenda, user }) {
  if (!user) {
    return <UnloggedBody agenda={agenda} />;
  }

  return <LoggedBody agenda={agenda} />;
}

export default function AggregateModal({
  isOpen,
  onClose: originalOnClose,
  agenda,
}: AggregateModalProps) {
  const intl = useIntl();
  const router = useRouter();

  const dialogRef = useRef<HTMLDivElement>(null);

  const { user, status } = useUser();

  // Remove displayAggregatorModal=1 from url
  const onClose = useCallback(() => {
    const url = new URL(router.asPath, 'https://n');

    url.searchParams.delete('displayAggregatorModal');

    router.replace(url.pathname + url.search, null, { shallow: true });
    originalOnClose();
  }, [originalOnClose, router]);

  return (
    <DialogRoot
      size="md"
      placement="center"
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent ref={dialogRef}>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.title)}
        </DialogHeader>
        <DialogCloseTrigger />

        {status === FetchStatus.Fetching ? (
          <ModalLoadingBody />
        ) : (
          <AggregateModalBody agenda={agenda} user={user} />
        )}
      </DialogContent>
    </DialogRoot>
  );
}
