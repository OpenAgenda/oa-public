'use client';

import { Container, Heading, Text, Button } from '@openagenda/uikit';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxW="3xl" bg="white" my="20" p="12" textAlign="center">
      <Heading as="h1" fontSize="6xl" mb="4">
        404
      </Heading>
      <Text fontSize="xl" mb="8">
        This page could not be found.
      </Text>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </Container>
  );
}
