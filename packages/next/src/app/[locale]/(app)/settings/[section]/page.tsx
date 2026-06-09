import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionCookie } from '@openagenda/auth/server';
import SettingsPageClient from '../_components/SettingsPageClient';

export const metadata: Metadata = {
  title: 'Settings | OpenAgenda',
  robots: { index: false, follow: false },
};

// /:locale/settings/<section> — the open accordion section is addressable in
// the URL (mirrors the legacy /settings/<tab> routes). The section is read
// client-side from the path; this page only guards + renders the same client.
export default async function SettingsSectionPage() {
  const h = await headers();
  if (!getSessionCookie(h, { cookiePrefix: 'oa' })) {
    redirect('/auth/signin?redirect=/settings');
  }

  return <SettingsPageClient />;
}
