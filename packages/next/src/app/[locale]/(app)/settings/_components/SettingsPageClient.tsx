'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
import UnlinkFacebookSection from './UnlinkFacebookSection';
import DeleteAccountSection from './DeleteAccountSection';

const messages = defineMessages({
  heading: {
    id: 'next.components.settings.Settings.heading',
    defaultMessage: 'Account parameters',
  },
});

// Legacy `/settings/<tab>` deep-links (notably the `emailSettingsLink` in every
// outgoing notification email, which points at /settings/emails) map to the
// section that exists now, so those links — including ones already sitting in
// inboxes — open the right panel instead of a fully-collapsed page.
const SECTION_ALIASES: Record<string, string> = {
  emails: 'notifications',
  unsubscribed: 'notifications',
};

export default function SettingsPageClient() {
  const intl = useIntl();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  // Detailed payload so sections get the `$client.detailed` fields they gate on
  // (ApiKeys → canCreateSecretKeys, Facebook → facebookUid), which the basic
  // `/users/me` omits.
  const { user, status } = useUser({
    redirectTo: '/auth/signin?redirect=/settings',
    detailed: true,
  });

  // Sections mutate the user after a successful save so the trigger summaries
  // (full name, language) stay in sync. Revalidate every `/users/me` variant
  // (basic + detailed) so both this page's detailed payload and the navbar's
  // basic one refresh.
  const refreshUser = useCallback(
    () => mutate((k) => typeof k === 'string' && k.startsWith('/users/me')),
    [mutate],
  );

  // The open section is reflected in the URL as /:locale/settings/<section>
  // (mirrors the legacy /settings/<tab> routes), and a deep link / back-forward
  // opens the matching accordion. Local state is the source of truth so the
  // single-open accordion still works where the router is a no-op (Storybook);
  // it's kept in sync with the URL below.
  const parts = pathname.split('/');
  const settingsIdx = parts.indexOf('settings');
  const settingsBase =
    settingsIdx >= 0 ? parts.slice(0, settingsIdx + 1).join('/') : pathname;
  const rawSection = (settingsIdx >= 0 && parts[settingsIdx + 1]) || null;
  const urlSection = rawSection
    ? SECTION_ALIASES[rawSection] ?? rawSection
    : null;

  const [openSection, setOpenSection] = useState<string | null>(urlSection);

  // Follow external URL changes (deep link, back/forward).
  useEffect(() => {
    setOpenSection(urlSection);
  }, [urlSection]);

  const handleSectionChange = useCallback(
    (value: string[]) => {
      const next = value[0] ?? null;
      setOpenSection(next);
      // Shallow URL sync, NOT a navigation: `router.replace` would swap the
      // /settings ↔ /settings/<section> leaf segment and remount this client
      // (re-running every section's fetch, dropping unsaved input). Native
      // history.replaceState integrates with the App Router (usePathname still
      // updates) but doesn't navigate, so the page stays mounted. The [section]
      // route still resolves these URLs on a hard GET / deep link.
      window.history.replaceState(
        null,
        '',
        next ? `${settingsBase}/${next}` : settingsBase,
      );
    },
    [settingsBase],
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
                <UnlinkFacebookSection user={user} />
                <DeleteAccountSection />
              </AccordionRoot>
            </VStack>
          ) : null}
        </Container>
      </main>
    </Box>
  );
}
