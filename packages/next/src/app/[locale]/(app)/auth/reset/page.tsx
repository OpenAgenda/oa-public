import type { Metadata } from 'next';
import ResetPasswordPageClient from './_components/ResetPasswordPageClient';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: 'Reset password | OpenAgenda',
  robots: { index: false, follow: false },
};

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = pickFirst(params.token) ?? null;

  return <ResetPasswordPageClient token={token} />;
}
