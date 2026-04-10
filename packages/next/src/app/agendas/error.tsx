'use client';

import { Container, Heading, Text, Button } from '@openagenda/uikit';

export default function AgendasError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container maxW="3xl" bg="white" my="20" p="12" textAlign="center">
      <Heading as="h1" fontSize="4xl" mb="4">
        Something went wrong
      </Heading>
      <Text mb="8">An error occurred while loading agendas.</Text>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
