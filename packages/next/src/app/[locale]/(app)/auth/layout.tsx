import { Surface } from '@openagenda/uikit';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Surface asChild maxW="md" mx="auto" my="20" p={{ base: '8', md: '12' }}>
      <main>{children}</main>
    </Surface>
  );
}
