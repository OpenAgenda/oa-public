'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, CloseButton, Dialog, Portal, chakra } from '@openagenda/uikit';
import Signin from './Signin';
import Signup from './Signup';
import SignupComplete from './SignupComplete';
import { type CaptchaProvider } from './captcha/CaptchaWidget';

const messages = defineMessages({
  dialogTitle: {
    id: 'next.components.auth.AuthDialog.dialogTitle',
    defaultMessage: 'Sign in',
  },
  dialogTitleLostPassword: {
    id: 'next.components.auth.AuthDialog.dialogTitleLostPassword',
    defaultMessage: 'Lost password',
  },
  dialogTitleSignup: {
    id: 'next.components.auth.AuthDialog.dialogTitleSignup',
    defaultMessage: 'Create an account',
  },
  dialogTitleSignupComplete: {
    id: 'next.components.auth.AuthDialog.dialogTitleSignupComplete',
    defaultMessage: 'Confirm your email address',
  },
  triggerLabel: {
    id: 'next.components.auth.AuthDialog.triggerLabel',
    defaultMessage: 'Sign in',
  },
});

const TITLE_BY_VIEW = {
  signin: messages.dialogTitle,
  lost: messages.dialogTitleLostPassword,
  signup: messages.dialogTitleSignup,
  signupComplete: messages.dialogTitleSignupComplete,
} as const;

type View = keyof typeof TITLE_BY_VIEW;

interface AuthDialogProps {
  children?: ReactNode;
  agenda?: { slug: string; uid: string };
  reloadOnSuccess?: boolean;
  redirectOnSuccess?: string;
  mtCaptchaSiteKey?: string;
  captchaProvider?: CaptchaProvider;
  defaultView?: 'signin' | 'signup';
  defaultEmail?: string;
  defaultFullName?: string;
  iToken?: string;
  invitation?: string;
  redirect?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AuthDialog({
  children,
  agenda,
  reloadOnSuccess,
  redirectOnSuccess,
  mtCaptchaSiteKey = process.env.NEXT_PUBLIC_MTCAPTCHA_SITEKEY,
  captchaProvider,
  defaultView = 'signin',
  defaultEmail,
  defaultFullName,
  iToken,
  invitation,
  redirect,
  open,
  onOpenChange,
}: AuthDialogProps) {
  const intl = useIntl();
  const [view, setView] = useState<View>(defaultView);
  const [viewAnnouncement, setViewAnnouncement] = useState<string | null>(null);
  const [completeData, setCompleteData] = useState<{
    email: string;
    resendUrl: string;
  } | null>(null);
  const isFirstViewRender = useRef(true);

  useEffect(() => {
    if (isFirstViewRender.current) {
      isFirstViewRender.current = false;
      return;
    }
    setViewAnnouncement(intl.formatMessage(TITLE_BY_VIEW[view]));
  }, [view, intl]);

  const closeOnInteractOutside = view !== 'signup' && view !== 'signupComplete';
  const isControlled = open !== undefined;

  return (
    <Dialog.Root
      placement="center"
      size="sm"
      closeOnInteractOutside={closeOnInteractOutside}
      open={open}
      onOpenChange={onOpenChange ? (e) => onOpenChange(e.open) : undefined}
    >
      {isControlled ? null : (
        <Dialog.Trigger asChild>
          {children ?? (
            <Button variant="outline">
              {intl.formatMessage(messages.triggerLabel)}
            </Button>
          )}
        </Dialog.Trigger>
      )}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {intl.formatMessage(TITLE_BY_VIEW[view])}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <chakra.span srOnly role="status" aria-live="polite">
                {viewAnnouncement}
              </chakra.span>
              {view === 'signupComplete' && completeData ? (
                <SignupComplete
                  email={completeData.email}
                  resendUrl={completeData.resendUrl}
                />
              ) : view === 'signup' ? (
                <Signup
                  agenda={agenda}
                  defaultEmail={defaultEmail}
                  defaultFullName={defaultFullName}
                  iToken={iToken}
                  invitation={invitation}
                  redirect={redirect}
                  reloadOnSuccess={reloadOnSuccess}
                  redirectOnSuccess={redirectOnSuccess}
                  mtCaptchaEnabled={!!mtCaptchaSiteKey}
                  mtCaptchaSiteKey={mtCaptchaSiteKey}
                  captchaProvider={captchaProvider}
                  onViewChange={setView}
                  onSignupComplete={(data) => {
                    setCompleteData(data);
                    setView('signupComplete');
                  }}
                />
              ) : (
                <Signin
                  agenda={agenda}
                  reloadOnSuccess={reloadOnSuccess}
                  redirectOnSuccess={redirectOnSuccess}
                  onViewChange={setView}
                />
              )}
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
