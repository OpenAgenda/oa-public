import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import getLocale from '@/src/utils/getLocale';
import getSession from '@/src/utils/getSession';
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
  const locale = await getLocale();
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  if (session?.user) {
    redirect(`/${locale}/home`);
  }

  const params = await searchParams;
  const redirectParam = pickFirst(params.redirect);
  // Verified-linking flow (phase 4): BA's OAuth callback redirects here when
  // `account_not_linked` triggers (existing OA user matched by email but no
  // `account` row for the provider). The Signin form then shows a banner
  // and posts `linkProvider` along with the credentials.
  const linkProviderParam = pickFirst(params.linkProvider);
  const linkProvider = linkProviderParam === 'google' ? 'google' : undefined;
  const linkError = pickFirst(params.linkError) === '1';
  // Pre-fill the email when BA's OAuth callback hands us one. `mapProfileToUser`
  // stashed it server-side, the after-hook on `/callback/:id` appended it to
  // the redirect URL. Only honour it when we're in the verified-linking flow.
  const defaultEmail = linkProvider ? pickFirst(params.email) : undefined;

  return (
    <SigninPageClient
      redirect={redirectParam}
      linkProvider={linkProvider}
      linkError={linkError}
      defaultEmail={defaultEmail}
    />
  );
}
