'use client';

import { Suspense } from 'react';
import SentryErrorBoundary from 'components/SentryErrorBoundary';
import DefaultNavbar from './Navbar';
import FlashAlert from './FlashAlert';

interface AppLayoutProps {
  children: React.ReactNode;
  navbar?: React.ReactNode;
}

export default function AppLayout({
  children,
  navbar = <DefaultNavbar />,
}: AppLayoutProps) {
  return (
    <>
      <Suspense>{navbar}</Suspense>
      <FlashAlert />
      <SentryErrorBoundary>{children}</SentryErrorBoundary>
    </>
  );
}
