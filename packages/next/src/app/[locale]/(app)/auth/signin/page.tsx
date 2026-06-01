import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionCookie } from '@openagenda/auth/server';
import SigninPageClient from './_components/SigninPageClient';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Sign in | OpenAgenda',
  robots: { index: false, follow: true },
};

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SigninPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const h = await headers();
  if (getSessionCookie(h, { cookiePrefix: 'oa' })) {
    // /home is a cibul-node legacy route, not a Next.js route — redirect
    // without the locale prefix so nginx routes it to cibul-node. The
    // localized variant (/fr/home) would fall through to Next's [agendaSlug]
    // page and render `home` as if it were an agenda slug.
    redirect('/home');
  }

  const params = await searchParams;
  const redirectParam = pickFirst(params.redirect);
  const invitation = pickFirst(params.invitation);
  // Verified-linking flow (phase 4): BA's OAuth callback redirects here when
  // `account_not_linked` triggers (existing OA user matched by email but no
  // `account` row for the provider). The Signin form then shows a banner
  // and posts `linkProvider` along with the credentials.
  const linkProviderParam = pickFirst(params.linkProvider);
  const linkProvider = linkProviderParam === 'google' ? 'google' : undefined;
  const linkError = pickFirst(params.linkError) === '1';
  // `view=lost` opens the lost-password sub-state directly. Used by the legacy
  // /password/lost → /auth/signin?view=lost redirect (cibul-node phase 6 lot 2).
  // `view=resend` opens the email-verification resend panel directly, used by
  // the legacy /activate/resend → /auth/signin?view=resend redirect.
  // Any other value falls back to the default signin form.
  const viewParam = pickFirst(params.view);
  const view: 'signin' | 'lost' | 'magic' | 'resend' =
    viewParam === 'lost'
      ? 'lost'
      : viewParam === 'magic'
        ? 'magic'
        : viewParam === 'resend'
          ? 'resend'
          : 'signin';
  // Pre-fill the email when BA's OAuth callback hands us one or when the
  // legacy /activate/resend redirect carries `email`. The OAuth case
  // (verified-linking) and the resend case are the only ones that should
  // pre-populate the form; ignore stray `?email=` params on a plain signin.
  const emailParam = pickFirst(params.email);
  const defaultEmail =
    linkProvider || view === 'resend' ? emailParam : undefined;
  // `msg=invalidActivation` is set by the cibul-node `/activate/:token`
  // façade when better-auth rejects the token (INVALID_TOKEN, TOKEN_EXPIRED,
  // USER_NOT_FOUND). We surface a banner on the signin form so the user
  // knows what happened — the legacy EJS `auth/invalidActivation` template
  // was retired with this redirect.
  // `msg=accountUnavailable` is set by the better-auth after-hooks when a
  // blacklisted / soft-removed user reaches the OAuth `/callback/:id` or the
  // magic-link `/verify` endpoint (see packages/auth/src/index.js): the session
  // is neutralised and the user is bounced here. Without a banner they would
  // land on a bare form with no explanation.
  const msg = pickFirst(params.msg);
  const banner: 'invalidActivation' | 'accountUnavailable' | undefined =
    msg === 'invalidActivation'
      ? 'invalidActivation'
      : msg === 'accountUnavailable'
        ? 'accountUnavailable'
        : undefined;

  return (
    <SigninPageClient
      redirect={redirectParam}
      invitation={invitation}
      linkProvider={linkProvider}
      linkError={linkError}
      defaultEmail={defaultEmail}
      view={view}
      banner={banner}
    />
  );
}
