'use client';

import { useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import useUser from '@/src/hooks/useUser';
import { FetchStatus } from '@/src/config/types';
import ModalLoadingBody from '@/src/components/ModalLoadingBody';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dialogRef = useRef<HTMLDivElement>(null);

  const { user, status } = useUser();

  // Remove displayAggregatorModal=1 from url
  const onClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('displayAggregatorModal');
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      search ? `${pathname}?${search}` : pathname,
    );
    originalOnClose();
  }, [originalOnClose, pathname, searchParams]);

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
