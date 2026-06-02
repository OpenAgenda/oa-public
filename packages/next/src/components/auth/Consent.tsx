'use client';

import { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl, type MessageDescriptor } from 'react-intl';
import {
  Button,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@openagenda/uikit';
import MessageAlert from '@/src/components/MessageAlert';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.Consent.heading',
    defaultMessage: 'Authorize {appName}',
  },
  intro: {
    id: 'next.components.auth.Consent.intro',
    defaultMessage:
      '{appName} would like to access your OpenAgenda account. It will be able to:',
  },
  fallbackAppName: {
    id: 'next.components.auth.Consent.fallbackAppName',
    defaultMessage: 'This application',
  },
  allow: {
    id: 'next.components.auth.Consent.allow',
    defaultMessage: 'Allow',
  },
  deny: {
    id: 'next.components.auth.Consent.deny',
    defaultMessage: 'Deny',
  },
  error: {
    id: 'next.components.auth.Consent.error',
    defaultMessage: 'Something went wrong. Please try again.',
  },
});

// Human-readable description for each scope OpenAgenda advertises. Keyed by the
// raw scope string so the requested set maps straight to a label; unknown
// scopes fall back to their raw value (forward-compatible with new scopes).
const scopeMessages = defineMessages({
  openid: {
    id: 'next.components.auth.Consent.scope.openid',
    defaultMessage: 'Verify your identity',
  },
  profile: {
    id: 'next.components.auth.Consent.scope.profile',
    defaultMessage: 'Read your public profile (name, picture)',
  },
  email: {
    id: 'next.components.auth.Consent.scope.email',
    defaultMessage: 'Read your email address',
  },
  offline_access: {
    id: 'next.components.auth.Consent.scope.offlineAccess',
    defaultMessage: 'Stay connected when you are away (refresh access)',
  },
  'events:read': {
    id: 'next.components.auth.Consent.scope.eventsRead',
    defaultMessage: 'Read your events',
  },
  'events:write': {
    id: 'next.components.auth.Consent.scope.eventsWrite',
    defaultMessage: 'Create and edit your events',
  },
  'events:transverse': {
    id: 'next.components.auth.Consent.scope.eventsTransverse',
    defaultMessage: 'Access events across all your agendas',
  },
  'agendas:read': {
    id: 'next.components.auth.Consent.scope.agendasRead',
    defaultMessage: 'Read your agendas',
  },
  'agendas:write': {
    id: 'next.components.auth.Consent.scope.agendasWrite',
    defaultMessage: 'Create and edit your agendas',
  },
  'locations:read': {
    id: 'next.components.auth.Consent.scope.locationsRead',
    defaultMessage: 'Read your locations',
  },
  'locations:write': {
    id: 'next.components.auth.Consent.scope.locationsWrite',
    defaultMessage: 'Create and edit your locations',
  },
  'members:read': {
    id: 'next.components.auth.Consent.scope.membersRead',
    defaultMessage: 'Read agenda members',
  },
  'members:write': {
    id: 'next.components.auth.Consent.scope.membersWrite',
    defaultMessage: 'Manage agenda members',
  },
});

interface ConsentProps {
  clientId?: string;
  scope?: string;
}

export default function Consent({ clientId, scope }: ConsentProps) {
  const intl = useIntl();
  const [appName, setAppName] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const scopes = (scope ?? '').split(' ').filter(Boolean);

  // Fetch the publicly-visible client fields for a friendly app name. Falls
  // back silently to the generic label when unavailable.
  useEffect(() => {
    if (!clientId) return undefined;
    let cancelled = false;
    fetch(
      `/api/auth/oauth2/public-client?client_id=${encodeURIComponent(clientId)}`,
      { headers: { accept: 'application/json' } },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setAppName(data.name ?? data.client_name ?? data.clientName);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const submit = useCallback(async (accept: boolean) => {
    setSubmitting(true);
    setError(false);
    try {
      // Replay the verbatim signed authorization query (incl. its `sig`).
      const oauthQuery = window.location.search.replace(/^\?/, '');
      const res = await fetch('/api/auth/oauth2/consent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ accept, oauth_query: oauthQuery }),
      });
      if (!res.ok) throw new Error('consent failed');
      const data = await res.json();
      if (data?.redirect_uri) {
        window.location.href = data.redirect_uri;
        return;
      }
      throw new Error('no redirect_uri');
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }, []);

  const displayName = appName ?? intl.formatMessage(messages.fallbackAppName);

  return (
    <>
      <Heading as="h1" size="xl" mb="6">
        {intl.formatMessage(messages.heading, { appName: displayName })}
      </Heading>

      {error && (
        <MessageAlert role="alert" status="error" mb="4">
          {intl.formatMessage(messages.error)}
        </MessageAlert>
      )}

      <Text mb="4">
        {intl.formatMessage(messages.intro, { appName: displayName })}
      </Text>

      <VStack
        as="ul"
        align="stretch"
        gap="2"
        mb="6"
        listStyleType="none"
        pl="0"
      >
        {scopes.map((s) => {
          const descriptor = (
            scopeMessages as Record<string, MessageDescriptor>
          )[s];
          return (
            <Text as="li" key={s}>
              • {descriptor ? intl.formatMessage(descriptor) : s}
            </Text>
          );
        })}
      </VStack>

      <HStack gap="3">
        <Button
          variant="solid"
          onClick={() => submit(true)}
          loading={submitting}
        >
          {intl.formatMessage(messages.allow)}
        </Button>
        <Button
          variant="outline"
          onClick={() => submit(false)}
          disabled={submitting}
        >
          {intl.formatMessage(messages.deny)}
        </Button>
      </HStack>

      {submitting && <Spinner mt="4" size="sm" />}
    </>
  );
}
