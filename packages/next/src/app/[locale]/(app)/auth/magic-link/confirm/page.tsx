import type { Metadata } from 'next';
import MagicLinkConfirmPageClient from './_components/MagicLinkConfirmPageClient';

export const metadata: Metadata = {
  title: 'Sign in | OpenAgenda',
  robots: { index: false, follow: false },
};

// Inert interstitial between the magic-link email and BA's token-consuming
// /api/auth/magic-link/verify. The token travels in the URL fragment, which is
// never sent to the server — so this page receives no token server-side and an
// email scanner that prefetches the link can't consume it. The client reads the
// fragment and auto-navigates to verify (no button).
export default function MagicLinkConfirmPage() {
  return <MagicLinkConfirmPageClient />;
}
