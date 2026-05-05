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

  return <SigninPageClient redirect={redirectParam} />;
}
