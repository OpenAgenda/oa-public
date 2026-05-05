'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import { chakra } from '@openagenda/uikit';
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

function AggregateModalBody({ agenda, user, loggedBodyRef }) {
  if (!user) {
    return <UnloggedBody agenda={agenda} />;
  }

  return <LoggedBody ref={loggedBodyRef} agenda={agenda} />;
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
  const [loggedBodyEl, setLoggedBodyEl] = useState<HTMLDivElement | null>(null);

  const { user, status } = useUser();

  const prevUserRef = useRef(user);
  const [justSignedIn, setJustSignedIn] = useState(false);

  useEffect(() => {
    if (!prevUserRef.current && user && isOpen) {
      setJustSignedIn(true);
    }
    prevUserRef.current = user;
  }, [user, isOpen]);

  useEffect(() => {
    if (
      justSignedIn &&
      user &&
      status === FetchStatus.Fetched &&
      loggedBodyEl
    ) {
      loggedBodyEl.focus();
      const timeout = setTimeout(() => setJustSignedIn(false), 2000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [justSignedIn, user, status, loggedBodyEl]);

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

        {justSignedIn ? (
          <chakra.span srOnly role="status" aria-live="polite">
            {intl.formatMessage(messages.signedIn)}
          </chakra.span>
        ) : null}
        {status === FetchStatus.Fetching ? (
          <ModalLoadingBody />
        ) : (
          <AggregateModalBody
            agenda={agenda}
            user={user}
            loggedBodyRef={setLoggedBodyEl}
          />
        )}
      </DialogContent>
    </DialogRoot>
  );
}
