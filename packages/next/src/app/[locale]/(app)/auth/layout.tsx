import { Box, Container } from '@openagenda/uikit';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box asChild>
      <main>
        <Container
          maxW="md"
          bg="white"
          my="20"
          p={{ base: '8', md: '12' }}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          boxShadow="lg"
        >
          {children}
        </Container>
      </main>
    </Box>
  );
}
