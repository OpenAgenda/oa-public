import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, Button, Spinner, Text, VStack } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import ky, { isHTTPError } from 'ky';
import useSWRMutation from 'swr/mutation';
import { contextBar as messages } from '../../messages';

const REDIRECT_DELAY_MS = 1500;
const SUPPORT_MAILTO = 'mailto:support@openagenda.com';

type Phase = 'idle' | 'loading' | 'success' | 'error';
type ErrorKind = 'notFound' | 'other';

interface RemoveEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendaUid: string | number;
  eventUid: string | number;
  isOriginAgenda: boolean;
  onCompleted: () => void;
}

async function deleteEvent(url: string): Promise<void> {
  await ky.delete(url);
}

export default function RemoveEventModal({
  isOpen,
  onClose,
  agendaUid,
  eventUid,
  isOriginAgenda,
  onCompleted,
}: RemoveEventModalProps) {
  const intl = useIntl();
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { trigger } = useSWRMutation(
    `/api/agendas/${agendaUid}/events/${eventUid}`,
    deleteEvent,
    {
      throwOnError: false,
      onSuccess: () => {
        setPhase('success');
        redirectTimerRef.current = setTimeout(() => {
          onCompleted();
        }, REDIRECT_DELAY_MS);
      },
      onError: (err) => {
        setPhase('error');
        setErrorKind(
          isHTTPError(err) && err.response.status === 404
            ? 'notFound'
            : 'other',
        );
      },
    },
  );

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setErrorKind(null);
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    setPhase('loading');
    setErrorKind(null);
    trigger();
  }, [trigger]);

  const lockedClosed = phase === 'loading' || phase === 'success';

  const handleOpenChange = useCallback(
    ({ open }: { open: boolean }) => {
      if (!open && !lockedClosed) {
        onClose();
      }
    },
    [lockedClosed, onClose],
  );

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <DialogRoot
      role="alertdialog"
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement="center"
    >
      <DialogContent>
        <DialogHeader
          fontSize="xl"
          fontWeight="semibold"
          justifyContent="center"
          textAlign="center"
          pb="4"
        >
          {intl.formatMessage(
            isOriginAgenda
              ? messages.deleteEventTitle
              : messages.removeEventTitle,
          )}
        </DialogHeader>

        {phase === 'success' ? (
          <DialogBody py="4">
            <VStack gap="4" role="status" aria-live="polite">
              <Text textAlign="center">
                {intl.formatMessage(
                  isOriginAgenda
                    ? messages.deleteSuccess
                    : messages.removeSuccess,
                )}
              </Text>
              <Spinner size="sm" />
            </VStack>
          </DialogBody>
        ) : phase === 'error' && errorKind === 'notFound' ? (
          <>
            <DialogBody py="4">
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Title>
                  {intl.formatMessage(messages.eventNotFound)}
                </Alert.Title>
              </Alert.Root>
            </DialogBody>
            <DialogFooter justifyContent="center" gap="3" pt="4">
              <Button colorPalette="blue" onClick={handleReload}>
                {intl.formatMessage(messages.reloadPage)}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                {intl.formatMessage(messages.cancel)}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogBody py="4">
              {phase === 'error' && errorKind === 'other' ? (
                <Alert.Root status="error">
                  <Alert.Indicator />
                  <Alert.Title>
                    {intl.formatMessage(messages.removeGenericError)}
                  </Alert.Title>
                </Alert.Root>
              ) : (
                <Text textAlign="center">
                  {intl.formatMessage(
                    isOriginAgenda
                      ? messages.deleteConfirmation
                      : messages.removeConfirmation,
                  )}
                </Text>
              )}
            </DialogBody>

            <DialogFooter justifyContent="center" gap="3" pt="4">
              <Button
                colorPalette="danger"
                loading={phase === 'loading'}
                loadingText={intl.formatMessage(
                  isOriginAgenda ? messages.deleting : messages.removing,
                )}
                onClick={handleConfirm}
              >
                {intl.formatMessage(
                  phase === 'error' && errorKind === 'other'
                    ? messages.retry
                    : isOriginAgenda
                      ? messages.delete
                      : messages.remove,
                )}
              </Button>
              {phase === 'error' && errorKind === 'other' ? (
                <Button variant="outline" asChild>
                  <a href={SUPPORT_MAILTO}>
                    {intl.formatMessage(messages.contactSupport)}
                  </a>
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={phase === 'loading'}
              >
                {intl.formatMessage(messages.cancel)}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
