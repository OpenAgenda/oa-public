import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionCookie } from '@openagenda/auth/server';
import SignupPageClient from './_components/SignupPageClient';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Sign up | OpenAgenda',
  robots: { index: false, follow: true },
};

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SignupPage({
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
  const invitation = pickFirst(params.invitation);
  const redirectParam = pickFirst(params.redirect);
  // `email` is forwarded by member-invitation mails (services/members/lib/mail.js)
  // to pre-fill the form. Untrusted, treated as a UI hint only — the user can
  // edit it; BA still validates the address on /sign-up/email.
  const email = pickFirst(params.email);

  return (
    <SignupPageClient
      invitation={invitation}
      redirect={redirectParam}
      email={email}
    />
  );
}
