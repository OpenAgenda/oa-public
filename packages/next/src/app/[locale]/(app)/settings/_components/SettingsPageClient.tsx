'use client';

import { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSWRConfig } from 'swr';
import {
  Box,
  Container,
  Heading,
  Spinner,
  VStack,
  chakra,
} from '@openagenda/uikit';
import { AccordionRoot } from '@openagenda/uikit/snippets';
import { FetchStatus } from 'config/types';
import useUser from '@/src/hooks/useUser';
import FullNameSection from './FullNameSection';
import LanguageSection from './LanguageSection';
import ImageSection from './ImageSection';
import DeleteAccountSection from './DeleteAccountSection';

const messages = defineMessages({
  heading: {
    id: 'next.components.settings.Settings.heading',
    defaultMessage: 'Account parameters',
  },
});

export default function SettingsPageClient() {
  const intl = useIntl();
  const { mutate } = useSWRConfig();
  const { user, status } = useUser({
    redirectTo: '/auth/signin?redirect=/settings',
  });

  // Sections mutate `/users/me` after a successful save so the trigger
  // summaries (full name, language) and any other consumer of the hook stay
  // in sync without a full reload.
  const refreshUser = useCallback(() => mutate('/users/me'), [mutate]);

  return (
    <Box asChild>
      <main>
        <Container maxW="3xl" bg="white" my="20" p="12">
          <Heading as="h1" size="xl" mb="6">
            {intl.formatMessage(messages.heading)}
          </Heading>

          {status === FetchStatus.Fetching && !user ? (
            <chakra.div display="flex" justifyContent="center" py="16">
              <Spinner />
            </chakra.div>
          ) : user ? (
            <VStack align="stretch" gap="0">
              <AccordionRoot multiple collapsible>
                <FullNameSection user={user} onUpdated={refreshUser} />
                <LanguageSection user={user} onUpdated={refreshUser} />
                <ImageSection user={user} onUpdated={refreshUser} />
                <DeleteAccountSection />
              </AccordionRoot>
            </VStack>
          ) : null}
        </Container>
      </main>
    </Box>
  );
}
