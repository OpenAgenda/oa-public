'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { defineMessages, useIntl, type MessageDescriptor } from 'react-intl';
import AuthDialog from 'components/auth/AuthDialog';

const AUTH_PARAM_KEYS = [
  'auth',
  'view',
  'email',
  'fullName',
  'invitation',
  'redirect',
  'msg',
] as const;

const messages = defineMessages({
  authRequired: {
    id: 'next.components.auth.AuthDialog.msg.authRequired',
    defaultMessage: 'You need to be authenticated to access this page.',
  },
  limitedAccessAgenda: {
    id: 'next.components.auth.AuthDialog.msg.limitedAccessAgenda',
    defaultMessage:
      'You need to be authenticated to access this agenda. Please sign in',
  },
  limitedAccessEvent: {
    id: 'next.components.auth.AuthDialog.msg.limitedAccessEvent',
    defaultMessage:
      'You need to be authenticated to access this event. Please sign in',
  },
  // `invalidActivation` is rendered with a title + description to mirror the
  // standalone signin page (`SigninPageClient`'s banner). The keys are shared
  // with that component to avoid duplicating translations across locales.
  invalidActivationTitle: {
    id: 'next.components.auth.Signin.invalidActivation.title',
    defaultMessage: 'The activation link is not valid',
  },
  invalidActivationDescription: {
    id: 'next.components.auth.Signin.invalidActivation.description',
    defaultMessage:
      'This can be because it has already been used. If that is the case, your account should be activated.',
  },
});

type MsgStatus = 'info' | 'success' | 'warning' | 'error';

type MsgEntry = {
  message: MessageDescriptor;
  description?: MessageDescriptor;
  // Defaults to `info` when omitted. `invalidActivation` uses `error` to
  // mirror the standalone signin page banner (failure semantics, not info).
  status?: MsgStatus;
};

const MSG_BY_CODE: Record<string, MsgEntry> = {
  authRequired: { message: messages.authRequired },
  limitedAccessAgenda: { message: messages.limitedAccessAgenda },
  limitedAccessEvent: { message: messages.limitedAccessEvent },
  invalidActivation: {
    message: messages.invalidActivationTitle,
    description: messages.invalidActivationDescription,
    status: 'error',
  },
};

// Mirrors AuthDialog's `defaultView` union (see components/auth/AuthDialog.tsx).
// `'lost'` opens AuthDialog in the lost-password sub-view of <Signin>;
// `'resend'` boots straight into <SignupComplete> (requires email).
type View = 'signin' | 'signup' | 'lost' | 'resend';

type Prefill = {
  view: View;
  defaultEmail?: string;
  defaultFullName?: string;
  invitation?: string;
  redirect?: string;
  message?: ReactNode;
  messageDescription?: ReactNode;
  messageStatus?: MsgStatus;
};

export default function InvitationAuthDialog({
  agenda,
}: {
  agenda: { slug: string; uid: string };
}) {
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth !== 'signup' && auth !== 'signin') return;

    const msgCode = searchParams.get('msg');
    const msgEntry = msgCode ? MSG_BY_CODE[msgCode] : undefined;

    // `view=lost|resend` is only meaningful when paired with `auth=signin`
    // (both sub-views live under Signin, cf. AuthDialog.tsx). Anything else
    // falls back to the bare `auth` view.
    const viewParam = searchParams.get('view');
    let view: View = auth;
    if (auth === 'signin' && (viewParam === 'lost' || viewParam === 'resend')) {
      view = viewParam;
    }

    setPrefill({
      view,
      defaultEmail: searchParams.get('email') ?? undefined,
      defaultFullName: searchParams.get('fullName') ?? undefined,
      invitation: searchParams.get('invitation') ?? undefined,
      redirect: searchParams.get('redirect') ?? undefined,
      message: msgEntry ? intl.formatMessage(msgEntry.message) : undefined,
      messageDescription: msgEntry?.description
        ? intl.formatMessage(msgEntry.description)
        : undefined,
      messageStatus: msgEntry?.status,
    });

    const next = new URLSearchParams(searchParams);
    AUTH_PARAM_KEYS.forEach((k) => next.delete(k));
    const search = next.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    window.history.replaceState(null, '', url);
  }, [pathname, searchParams, intl]);

  if (!prefill) return null;

  return (
    <AuthDialog
      agenda={agenda}
      defaultView={prefill.view}
      defaultEmail={prefill.defaultEmail}
      defaultFullName={prefill.defaultFullName}
      invitation={prefill.invitation}
      redirect={prefill.redirect}
      message={prefill.message}
      messageDescription={prefill.messageDescription}
      messageStatus={prefill.messageStatus}
      reloadOnSuccess={!prefill.redirect}
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) setPrefill(null);
      }}
    />
  );
}
