import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import getLocale from '@/src/utils/getLocale';
import getSession from '@/src/utils/getSession';
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
  const locale = await getLocale();
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  if (session?.user) {
    redirect(`/${locale}/home`);
  }

  const params = await searchParams;
  const iToken = pickFirst(params.iToken);
  const invitation = pickFirst(params.invitation);
  const redirectParam = pickFirst(params.redirect);

  return (
    <SignupPageClient
      iToken={iToken}
      invitation={invitation}
      redirect={redirectParam}
    />
  );
}
