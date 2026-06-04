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

  // Presence check (not the signed cookie-cache): it tracks the same long-lived
  // `session_token` that `/oauth2/authorize` validates, so the two endpoints
  // agree on whether a session exists. Validating the cache cookie here instead
  // would bounce on its shorter TTL while authorize still sees a live session →
  // a consent↔authorize loop. This is a one-shot safety net (the cookie having
  // vanished between authorize and here), not a real authorization gate.
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
      // `/oauth2/authorize` validated this `redirect_uri` against the client's
      // registered set before signing the query that bounced here, so it is the
      // address the code WILL actually be sent to — trustworthy to display as
      // the anti-phishing signal (the client's self-asserted name is not).
      redirectUri={pickFirst(params.redirect_uri)}
    />
  );
}
