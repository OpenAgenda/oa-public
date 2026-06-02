import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionCookie } from '@openagenda/auth/server';
import Consent from 'components/auth/Consent';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Authorize application | OpenAgenda',
  robots: { index: false, follow: false },
};

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

// Consent screen for the OAuth 2.1 provider. The `oauth-provider` plugin 302s
// here (path configured as `consentPage` in packages/auth) with the full signed
// authorization query when an authenticated user has not yet consented to the
// requested scopes. The page reads `client_id` / `scope` for display; the
// client component replays the *verbatim* query string (incl. its `sig`) to
// `/oauth2/consent` to finalize, so we never reconstruct/re-encode it here.
export default async function ConsentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const h = await headers();
  const params = await searchParams;

  if (!getSessionCookie(h, { cookiePrefix: 'oa' })) {
    // Session expired between /oauth2/authorize and here. Re-enter the flow at
    // authorize (which will route the user through sign-in and back). The
    // query is rebuilt only for this bounce — authorize re-signs it, so exact
    // byte-for-byte fidelity is not required here.
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      const first = pickFirst(value);
      if (first != null) qs.set(key, first);
    }
    redirect(`/api/auth/oauth2/authorize?${qs.toString()}`);
  }

  return (
    <Consent
      clientId={pickFirst(params.client_id)}
      scope={pickFirst(params.scope)}
    />
  );
}
