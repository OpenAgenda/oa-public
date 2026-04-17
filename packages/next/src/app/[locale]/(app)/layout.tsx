import AppLayout from '@/src/components/app/Layout';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
