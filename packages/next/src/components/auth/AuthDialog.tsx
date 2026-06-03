'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, CloseButton, Dialog, Portal, chakra } from '@openagenda/uikit';
import MessageAlert from '@/src/components/MessageAlert';
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
    defaultMessage: 'Check your inbox',
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
  // `'lost'` opens AuthDialog with the lost-password sub-view of <Signin>
  // already toggled (mirrors the standalone signin page's `?view=lost`).
  // `'resend'` boots straight into <SignupComplete> with the supplied
  // `defaultEmail` (mirrors `?view=resend&email=…` on the signin page).
  // The latter requires `defaultEmail`; without it we fall back to signin.
  defaultView?: 'signin' | 'signup' | 'lost' | 'resend';
  defaultEmail?: string;
  defaultFullName?: string;
  invitation?: string;
  redirect?: string;
  // The banner shown above the form. `message` becomes the title (or single
  // line when no description). `messageDescription` is rendered as the alert
  // description below — used by `InvitationAuthDialog` to mirror the rich
  // title+description pattern from the standalone signin page (e.g. the
  // `invalidActivation` banner).
  message?: string | ReactNode;
  messageDescription?: ReactNode;
  // Visual + a11y variant for the message banner. Defaults to `info` (used by
  // `authRequired`, `limitedAccess*` which are informational). Callers should
  // pass `error` for failure semantics like `invalidActivation` to mirror the
  // standalone signin page banner.
  messageStatus?: 'info' | 'success' | 'warning' | 'error';
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
  invitation,
  redirect,
  message,
  messageDescription,
  messageStatus = 'info',
  open,
  onOpenChange,
}: AuthDialogProps) {
  const intl = useIntl();
  // Translate the public `defaultView` into the internal `View` union:
  //   - `'lost'` → start in `signin` and pass `defaultLostPassword` to <Signin>
  //   - `'resend'` (with email) → start in `signupComplete` directly
  //   - `'resend'` without email → fall back to `signin` (no usable target)
  //   - `'signin' | 'signup'` → identity
  const initialView: View =
    defaultView === 'lost'
      ? 'signin'
      : defaultView === 'resend'
        ? defaultEmail
          ? 'signupComplete'
          : 'signin'
        : defaultView;
  const [view, setView] = useState<View>(initialView);
  const [viewAnnouncement, setViewAnnouncement] = useState<string | null>(null);
  const [completeData, setCompleteData] = useState<{
    email: string;
    callbackURL?: string;
  } | null>(
    defaultView === 'resend' && defaultEmail ? { email: defaultEmail } : null,
  );
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
  const messageId = useId();

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
          <Dialog.Content aria-describedby={message ? messageId : undefined}>
            <Dialog.Header>
              <Dialog.Title>
                {intl.formatMessage(TITLE_BY_VIEW[view])}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <chakra.span srOnly role="status" aria-live="polite">
                {viewAnnouncement}
              </chakra.span>
              {message && (
                <MessageAlert
                  id={messageId}
                  role={messageStatus === 'error' ? 'alert' : 'status'}
                  status={messageStatus}
                  mb="4"
                  description={messageDescription}
                >
                  {message}
                </MessageAlert>
              )}
              {view === 'signupComplete' && completeData ? (
                <SignupComplete
                  email={completeData.email}
                  callbackURL={completeData.callbackURL}
                />
              ) : view === 'signup' ? (
                <Signup
                  agenda={agenda}
                  defaultEmail={defaultEmail}
                  defaultFullName={defaultFullName}
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
                  redirect={redirect}
                  reloadOnSuccess={reloadOnSuccess}
                  redirectOnSuccess={redirectOnSuccess}
                  defaultEmail={defaultEmail}
                  defaultLostPassword={defaultView === 'lost'}
                  onViewChange={setView}
                  onActivationRequired={(data) => {
                    setCompleteData(data);
                    setView('signupComplete');
                  }}
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
