'use client';

import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Heading, Spinner, Text, VStack } from '@openagenda/uikit';
import MessageAlert from '@/src/components/MessageAlert';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.MagicLinkConfirm.heading',
    defaultMessage: 'Signing you in…',
  },
  intro: {
    id: 'next.components.auth.MagicLinkConfirm.intro',
    defaultMessage: 'Please wait while we sign you in.',
  },
  invalid: {
    id: 'next.components.auth.MagicLinkConfirm.invalid',
    defaultMessage:
      'This sign-in link is invalid or has expired. Please request a new one.',
  },
});

export default function MagicLinkConfirmPageClient() {
  const intl = useIntl();
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // The token lives in the URL fragment (#…), which the browser never sends
    // to the server. An email scanner that GETs this page therefore can't read
    // or consume the one-time token. We read it client-side and navigate to
    // BA's verify endpoint — no button, no click. `replace` keeps the
    // (now-consumed) confirm URL out of history so Back doesn't re-trigger it.
    const raw = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(raw);
    const token = params.get('token');
    if (!token) {
      setInvalid(true);
      return;
    }
    const verify = new URLSearchParams({ token });
    const callbackURL = params.get('callbackURL');
    // BA's /magic-link/verify decodes callbackURL TWICE (better-call's router
    // decodes the query param, then the handler calls decodeURIComponent on it
    // again). URLSearchParams only encodes once, so we pre-encode to compensate
    // — otherwise a callbackURL whose nested `next`/query contains `&`/`=` gets
    // corrupted (e.g. /post-activate sees a truncated next + a spurious param).
    if (callbackURL) verify.set('callbackURL', encodeURIComponent(callbackURL));
    window.location.replace(`/api/auth/magic-link/verify?${verify.toString()}`);
  }, []);

  if (invalid) {
    return (
      <>
        <Heading as="h1" size="xl" mb="6">
          {intl.formatMessage(messages.heading)}
        </Heading>
        <MessageAlert role="alert" status="error">
          {intl.formatMessage(messages.invalid)}
        </MessageAlert>
      </>
    );
  }

  return (
    <VStack gap="4" py="8" role="status" aria-live="polite">
      <Heading as="h1" size="xl">
        {intl.formatMessage(messages.heading)}
      </Heading>
      <Text textAlign="center">{intl.formatMessage(messages.intro)}</Text>
      <Spinner size="md" />
    </VStack>
  );
}
