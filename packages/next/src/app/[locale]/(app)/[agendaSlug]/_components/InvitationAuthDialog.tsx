'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { defineMessages, useIntl, type MessageDescriptor } from 'react-intl';
import AuthDialog from 'components/auth/AuthDialog';

const AUTH_PARAM_KEYS = [
  'auth',
  'email',
  'fullName',
  'iToken',
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
});

const MSG_BY_CODE: Record<string, MessageDescriptor> = {
  authRequired: messages.authRequired,
  limitedAccessAgenda: messages.limitedAccessAgenda,
  limitedAccessEvent: messages.limitedAccessEvent,
};

type View = 'signin' | 'signup';

type Prefill = {
  view: View;
  defaultEmail?: string;
  defaultFullName?: string;
  iToken?: string;
  invitation?: string;
  redirect?: string;
  message?: string;
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
    const msgDescriptor = msgCode ? MSG_BY_CODE[msgCode] : undefined;

    setPrefill({
      view: auth,
      defaultEmail: searchParams.get('email') ?? undefined,
      defaultFullName: searchParams.get('fullName') ?? undefined,
      iToken: searchParams.get('iToken') ?? undefined,
      invitation: searchParams.get('invitation') ?? undefined,
      redirect: searchParams.get('redirect') ?? undefined,
      message: msgDescriptor ? intl.formatMessage(msgDescriptor) : undefined,
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
      iToken={prefill.iToken}
      invitation={prefill.invitation}
      redirect={prefill.redirect}
      message={prefill.message}
      reloadOnSuccess={!prefill.redirect}
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) setPrefill(null);
      }}
    />
  );
}
