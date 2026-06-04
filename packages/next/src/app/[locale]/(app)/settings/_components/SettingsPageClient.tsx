'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import EmailSection from './EmailSection';
import PasswordSection from './PasswordSection';
import ImageSection from './ImageSection';
import ApiKeysSection from './ApiKeysSection';
import NotificationsSection from './NotificationsSection';
import DeleteAccountSection from './DeleteAccountSection';

const messages = defineMessages({
  heading: {
    id: 'next.components.settings.Settings.heading',
    defaultMessage: 'Account parameters',
  },
});

export default function SettingsPageClient() {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const { user, status } = useUser({
    redirectTo: '/auth/signin?redirect=/settings',
  });

  // Sections mutate `/users/me` after a successful save so the trigger
  // summaries (full name, language) and any other consumer of the hook stay
  // in sync without a full reload.
  const refreshUser = useCallback(() => mutate('/users/me'), [mutate]);

  // The open section is reflected in the URL as /:locale/settings/<section>
  // (mirrors the legacy /settings/<tab> routes), and a deep link / back-forward
  // opens the matching accordion. Local state is the source of truth so the
  // single-open accordion still works where the router is a no-op (Storybook);
  // it's kept in sync with the URL below.
  const parts = pathname.split('/');
  const settingsIdx = parts.indexOf('settings');
  const settingsBase =
    settingsIdx >= 0 ? parts.slice(0, settingsIdx + 1).join('/') : pathname;
  const urlSection = (settingsIdx >= 0 && parts[settingsIdx + 1]) || null;

  const [openSection, setOpenSection] = useState<string | null>(urlSection);

  // Follow external URL changes (deep link, back/forward).
  useEffect(() => {
    setOpenSection(urlSection);
  }, [urlSection]);

  const handleSectionChange = useCallback(
    (value: string[]) => {
      const next = value[0] ?? null;
      setOpenSection(next);
      router.replace(next ? `${settingsBase}/${next}` : settingsBase, {
        scroll: false,
      });
    },
    [router, settingsBase],
  );

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
              <AccordionRoot
                collapsible
                value={openSection ? [openSection] : []}
                onValueChange={(details: { value: string[] }) =>
                  handleSectionChange(details.value)
                }
              >
                <FullNameSection user={user} onUpdated={refreshUser} />
                <LanguageSection user={user} onUpdated={refreshUser} />
                {user.hasLocalAccount && (
                  <>
                    <EmailSection user={user} />
                    <PasswordSection />
                  </>
                )}
                <ImageSection user={user} onUpdated={refreshUser} />
                <ApiKeysSection user={user} />
                <NotificationsSection user={user} />
                <DeleteAccountSection />
              </AccordionRoot>
            </VStack>
          ) : null}
        </Container>
      </main>
    </Box>
  );
}
