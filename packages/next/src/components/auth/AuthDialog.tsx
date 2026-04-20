'use client';

import { useState, type ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, CloseButton, Dialog, Portal } from '@openagenda/uikit';
import Signin from './Signin';

const messages = defineMessages({
  dialogTitle: {
    id: 'next.components.auth.AuthDialog.dialogTitle',
    defaultMessage: 'Sign in',
  },
  dialogTitleLostPassword: {
    id: 'next.components.auth.AuthDialog.dialogTitleLostPassword',
    defaultMessage: 'Lost password',
  },
  triggerLabel: {
    id: 'next.components.auth.AuthDialog.triggerLabel',
    defaultMessage: 'Sign in',
  },
});

interface AuthDialogProps {
  children?: ReactNode;
  agenda?: { slug: string; uid: string };
  reloadOnSuccess?: boolean;
}

export default function AuthDialog({
  children,
  agenda,
  reloadOnSuccess,
}: AuthDialogProps) {
  const intl = useIntl();
  const [view, setView] = useState<'signin' | 'lost'>('signin');

  return (
    <Dialog.Root placement="center" size="sm">
      <Dialog.Trigger asChild>
        {children ?? (
          <Button variant="outline">
            {intl.formatMessage(messages.triggerLabel)}
          </Button>
        )}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {intl.formatMessage(
                  view === 'lost'
                    ? messages.dialogTitleLostPassword
                    : messages.dialogTitle,
                )}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Signin
                agenda={agenda}
                reloadOnSuccess={reloadOnSuccess}
                onViewChange={setView}
              />
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
