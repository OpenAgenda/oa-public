import { Box, Container } from '@openagenda/uikit';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box asChild>
      <main>
        <Container maxW="md" bg="white" my="20" p="12">
          {children}
        </Container>
      </main>
    </Box>
  );
}
