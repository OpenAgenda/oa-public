'use client';

import { useIntl } from 'react-intl';
import { Container, Heading, Text, Box } from '@openagenda/uikit';

export default function ExampleContent() {
  const intl = useIntl();

  return (
    <Container maxW="7xl" py="8">
      <Heading size="xl" mb="4">
        App Router - Example
      </Heading>
      <Box p="4" bg="gray.50" borderRadius="md">
        <Text>Locale: {intl.locale}</Text>
        <Text>This page is served by the Next.js App Router.</Text>
      </Box>
    </Container>
  );
}
