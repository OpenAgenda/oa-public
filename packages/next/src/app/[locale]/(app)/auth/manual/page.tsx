import type { Metadata } from 'next';
import ManualPageClient from './_components/ManualPageClient';

export const metadata: Metadata = {
  title: 'Account verification | OpenAgenda',
  robots: { index: false, follow: false },
};

export default function ManualPage() {
  return <ManualPageClient />;
}
