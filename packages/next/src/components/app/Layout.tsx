'use client';

import { Suspense } from 'react';
import Announcement from 'components/Announcement';
import SentryErrorBoundary from 'components/SentryErrorBoundary';
import Navbar from './Navbar';
import FlashAlert from './FlashAlert';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      <Announcement />
      <FlashAlert />
      <SentryErrorBoundary>{children}</SentryErrorBoundary>
    </>
  );
}
