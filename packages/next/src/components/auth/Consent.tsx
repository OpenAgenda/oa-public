'use client';

import { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl, type MessageDescriptor } from 'react-intl';
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRotateRight,
  faBookOpen,
  faCalendar,
  faCalendarPen,
  faEnvelope,
  faIdBadge,
  faKey,
  faLayerGroup,
  faLocationDot,
  faPuzzlePiece,
  faUser,
  faUsers,
} from '@fortawesome/pro-regular-svg-icons';
import { faTriangleExclamation } from '@fortawesome/pro-solid-svg-icons';
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
  unverifiedTitle: {
    id: 'next.components.auth.Consent.unverifiedTitle',
    defaultMessage: 'OpenAgenda has not verified this application',
  },
  unverifiedBody: {
    id: 'next.components.auth.Consent.unverifiedBody',
    defaultMessage:
      'Anyone can register an application under any name. Only continue if you trust it.',
  },
  redirectNotice: {
    id: 'next.components.auth.Consent.redirectNotice',
    defaultMessage: 'After authorizing, you will be sent to {host}.',
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

// A glyph per scope, mirroring `scopeMessages`. Keyed by the raw scope so the
// requested set maps straight to an icon; unknown scopes fall back to a generic
// key (forward-compatible with new scopes, like the label lookup).
const scopeIcons: Record<string, IconDefinition> = {
  openid: faIdBadge,
  profile: faUser,
  email: faEnvelope,
  offline_access: faArrowRotateRight,
  'events:read': faCalendar,
  'events:write': faCalendarPen,
  'events:transverse': faLayerGroup,
  'agendas:read': faBookOpen,
  'agendas:write': faBookOpen,
  'locations:read': faLocationDot,
  'locations:write': faLocationDot,
  'members:read': faUsers,
  'members:write': faUsers,
};

// Scoped, reduced-motion-aware stagger for the permission rows. A bare <style>
// tag (not Emotion <Global>) keeps the keyframes local to this screen.
const rowAnimationCss = `
@keyframes oaConsentRowIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.oa-consent-perm { opacity: 0; animation: oaConsentRowIn 0.34s ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  .oa-consent-perm { opacity: 1; animation: none; }
}
`;

interface ConsentProps {
  clientId?: string;
  scope?: string;
  redirectUri?: string;
}

// Host the authorization code will be delivered to, for display. `redirectUri`
// was already validated by `/oauth2/authorize` against the client's registered
// set, so the host is genuine; we still parse defensively and drop anything
// unparseable rather than render a misleading value.
function redirectHostOf(redirectUri?: string): string | undefined {
  if (!redirectUri) return undefined;
  try {
    return new URL(redirectUri).host;
  } catch {
    return undefined;
  }
}

export default function Consent({
  clientId,
  scope,
  redirectUri,
}: ConsentProps) {
  const intl = useIntl();
  const [appName, setAppName] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const scopes = (scope ?? '').split(' ').filter(Boolean);
  const redirectHost = redirectHostOf(redirectUri);

  // Fetch the publicly-visible client fields for a friendly app name. Falls
  // back silently to the generic label when unavailable. We read ONLY the name:
  // the endpoint also exposes `icon` (logo_uri) and `uri` (client_uri), but
  // those are self-asserted at registration and unverified, so rendering them
  // would hand a phisher a trust badge (an official-looking logo / link). The
  // genuine, non-spoofable signal is the redirect host shown below.
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
      // The endpoint answers `{ redirect: true, url }` (its OpenAPI doc
      // mislabels this `redirect_uri`); `url` carries the code on accept or the
      // access_denied error on deny. Keep `redirect_uri` as a defensive fallback.
      const url = data?.url ?? data?.redirect_uri;
      if (url) {
        window.location.href = url;
        return;
      }
      throw new Error('no redirect url');
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }, []);

  const displayName = appName ?? intl.formatMessage(messages.fallbackAppName);
  // First letter of the resolved app name for the avatar; falls back to a
  // generic glyph when the name is the placeholder (lookup still pending/failed).
  const initial = appName?.trim().charAt(0).toUpperCase();

  return (
    <>
      <style>{rowAnimationCss}</style>

      {/* Identity header. The avatar is intentionally neutral (no brand colors,
          no fetched logo): the app is unverified, and the amber corner badge
          ties that status to its identity at a glance. */}
      <VStack gap="3" mb="6">
        <Box position="relative" w="16" h="16">
          <Flex
            w="16"
            h="16"
            align="center"
            justify="center"
            borderRadius="2xl"
            bg="gray.100"
            color="gray.700"
            fontSize="2xl"
            fontWeight="bold"
            aria-hidden="true"
          >
            {initial || <FontAwesomeIcon icon={faPuzzlePiece} />}
          </Flex>
          <Flex
            position="absolute"
            bottom="-1"
            right="-1"
            w="6"
            h="6"
            align="center"
            justify="center"
            borderRadius="full"
            bg="orange.400"
            color="white"
            fontSize="xs"
            borderWidth="2px"
            borderColor="white"
            aria-hidden="true"
          >
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </Flex>
        </Box>

        <Heading as="h1" size="lg" textAlign="center">
          {intl.formatMessage(messages.heading, { appName: displayName })}
        </Heading>
      </VStack>

      {error && (
        <MessageAlert role="alert" status="error" mb="4">
          {intl.formatMessage(messages.error)}
        </MessageAlert>
      )}

      {/* Anti-impersonation rampart for the open (DCR) client registry: every
          client that reaches this screen is non-trusted (trusted clients skip
          consent, and DCR is forbidden from setting skip_consent), so we always
          warn that the app is unverified and surface the real redirect host.
          A "verified apps" allowlist could later suppress this for first-party
          clients — none exist today, so erring toward the warning is correct. */}
      <MessageAlert
        status="warning"
        mb="6"
        description={
          <>
            <Text>{intl.formatMessage(messages.unverifiedBody)}</Text>
            {redirectHost && (
              <Text mt="2">
                {intl.formatMessage(messages.redirectNotice, {
                  host: (
                    <Code
                      colorPalette="orange"
                      fontWeight="bold"
                      wordBreak="break-all"
                    >
                      {redirectHost}
                    </Code>
                  ),
                })}
              </Text>
            )}
          </>
        }
      >
        {intl.formatMessage(messages.unverifiedTitle)}
      </MessageAlert>

      <Text mb="3" color="fg.muted">
        {intl.formatMessage(messages.intro, { appName: displayName })}
      </Text>

      <VStack
        as="ul"
        align="stretch"
        gap="1"
        mb="8"
        listStyleType="none"
        pl="0"
      >
        {scopes.map((s, index) => {
          const descriptor = (
            scopeMessages as Record<string, MessageDescriptor>
          )[s];
          return (
            <Flex
              as="li"
              key={s}
              className="oa-consent-perm"
              style={{ animationDelay: `${index * 45}ms` }}
              align="center"
              gap="3"
              px="2"
              py="2"
              borderRadius="md"
              transition="background 0.15s"
              _hover={{ bg: 'gray.50' }}
            >
              <Flex
                flexShrink={0}
                align="center"
                justify="center"
                w="9"
                h="9"
                borderRadius="lg"
                bg="blue.50"
                color="blue.600"
                fontSize="sm"
                aria-hidden="true"
              >
                <FontAwesomeIcon icon={scopeIcons[s] ?? faKey} fixedWidth />
              </Flex>
              <Text>{descriptor ? intl.formatMessage(descriptor) : s}</Text>
            </Flex>
          );
        })}
      </VStack>

      <HStack gap="3" justify="flex-end">
        <Button
          variant="outline"
          size="lg"
          onClick={() => submit(false)}
          disabled={submitting}
        >
          {intl.formatMessage(messages.deny)}
        </Button>
        <Button
          variant="solid"
          colorPalette="blue"
          size="lg"
          onClick={() => submit(true)}
          loading={submitting}
        >
          {intl.formatMessage(messages.allow)}
        </Button>
      </HStack>
    </>
  );
}
