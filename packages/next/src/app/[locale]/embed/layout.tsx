import { Suspense } from 'react';
import EmbedLayoutShell from './_components/EmbedLayoutShell';

export default function EmbedGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // EmbedLayoutShell reads useSearchParams; the Suspense boundary avoids
  // bailing out the whole segment during CSR navigation.
  return (
    <Suspense>
      <EmbedLayoutShell>{children}</EmbedLayoutShell>
    </Suspense>
  );
}
