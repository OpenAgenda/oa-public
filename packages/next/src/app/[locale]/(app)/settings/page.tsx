import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionCookie } from '@openagenda/auth/server';
import SettingsPageClient from './_components/SettingsPageClient';

export const metadata: Metadata = {
  title: 'Settings | OpenAgenda',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const h = await headers();
  // Settings is account-only — bounce anonymous visitors to sign-in and send
  // them back here afterwards. The client component still guards via
  // `useUser({ redirectTo })` in case the session expires while on the page.
  if (!getSessionCookie(h, { cookiePrefix: 'oa' })) {
    redirect('/auth/signin?redirect=/settings');
  }

  return <SettingsPageClient />;
}
