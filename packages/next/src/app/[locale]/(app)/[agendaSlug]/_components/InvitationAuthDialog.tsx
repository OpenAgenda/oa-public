'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AuthDialog from 'components/auth/AuthDialog';

const AUTH_PARAM_KEYS = [
  'auth',
  'email',
  'fullName',
  'iToken',
  'invitation',
  'redirect',
] as const;

type Prefill = {
  defaultEmail?: string;
  defaultFullName?: string;
  iToken?: string;
  invitation?: string;
  redirect?: string;
};

export default function InvitationAuthDialog({
  agenda,
}: {
  agenda: { slug: string; uid: string };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  useEffect(() => {
    if (searchParams.get('auth') !== 'signup') return;

    setPrefill({
      defaultEmail: searchParams.get('email') ?? undefined,
      defaultFullName: searchParams.get('fullName') ?? undefined,
      iToken: searchParams.get('iToken') ?? undefined,
      invitation: searchParams.get('invitation') ?? undefined,
      redirect: searchParams.get('redirect') ?? undefined,
    });

    const next = new URLSearchParams(searchParams);
    AUTH_PARAM_KEYS.forEach((k) => next.delete(k));
    const search = next.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    window.history.replaceState(null, '', url);
  }, [pathname, searchParams]);

  if (!prefill) return null;

  return (
    <AuthDialog
      agenda={agenda}
      defaultView="signup"
      defaultEmail={prefill.defaultEmail}
      defaultFullName={prefill.defaultFullName}
      iToken={prefill.iToken}
      invitation={prefill.invitation}
      redirect={prefill.redirect}
      reloadOnSuccess
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) setPrefill(null);
      }}
    />
  );
}
