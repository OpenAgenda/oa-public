'use client';

import Announcement from 'components/Announcement';
import SentryErrorBoundary from 'components/SentryErrorBoundary';
import Navbar from './Navbar';
import FlashAlert from './FlashAlert';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Announcement />
      <FlashAlert />
      <SentryErrorBoundary>{children}</SentryErrorBoundary>
    </>
  );
}
