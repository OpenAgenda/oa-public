'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Field,
  HStack,
  Input,
  Text,
  VStack,
  chakra,
} from '@openagenda/uikit';
import { buildPostActivateCallbackURL } from '@/src/lib/computePostSignInRedirect';
import MessageAlert from '@/src/components/MessageAlert';

const messages = defineMessages({
  intro: {
    id: 'next.components.auth.MagicLink.intro',
    defaultMessage:
      'Enter your email to receive a sign-in link. No password needed. The link is valid for 10 minutes.',
  },
  emailLabel: {
    id: 'next.components.auth.MagicLink.emailLabel',
    defaultMessage: 'Email',
  },
  emailPlaceholder: {
    id: 'next.components.auth.MagicLink.emailPlaceholder',
    defaultMessage: 'you@example.com',
  },
  submitLabel: {
    id: 'next.components.auth.MagicLink.submitLabel',
    defaultMessage: 'Send the link',
  },
  cancelLabel: {
    id: 'next.components.auth.MagicLink.cancelLabel',
    defaultMessage: 'Cancel',
  },
  // Uniform message shown whatever the account state — never reveals whether
  // an account exists for the entered address (anti-enumeration, mirrors the
  // uniform 200 response from /sign-in/magic-link).
  successMessage: {
    id: 'next.components.auth.MagicLink.successMessage',
    defaultMessage:
      "If an account exists for this email, a sign-in link has been sent. Delivery may take a few minutes. Check your inbox and your spam folder. If you don't receive it, you can request another in a minute.",
  },
  genericError: {
    id: 'next.components.auth.MagicLink.genericError',
    defaultMessage: 'An error occurred. Please try again.',
  },
  formTitle: {
    id: 'next.components.auth.MagicLink.formTitle',
    defaultMessage: 'Sign in by email form',
  },
});

interface MagicLinkProps {
  defaultEmail?: string;
  defaultSuccess?: boolean;
  defaultLoading?: boolean;
  // Context used to build the post-sign-in landing (/post-activate) so it
  // preserves agenda / invitation / redirect, exactly like the password and
  // verify flows (see buildPostActivateCallbackURL).
  agenda?: { slug: string; uid: string };
  redirect?: string;
  invitation?: string;
  onCancel: () => void;
}

export default function MagicLink({
  defaultEmail = '',
  defaultSuccess = false,
  defaultLoading = false,
  agenda,
  redirect,
  invitation,
  onCancel,
}: MagicLinkProps) {
  const intl = useIntl();
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(defaultLoading);
  const [success, setSuccess] = useState(defaultSuccess);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const successContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (success) {
      successContainerRef.current?.focus();
    }
  }, [success]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage(null);
      setLoading(true);

      try {
        // Route the post-sign-in landing through /post-activate (agenda
        // landing, invitation binding, open-redirect sanitisation, BA error
        // interception) — same hop as email verification. The magic-link
        // callback echoes this callbackURL into the confirm-page fragment.
        const callbackURL = buildPostActivateCallbackURL({
          redirectParam: redirect,
          agendaSlug: agenda?.slug,
          invitation,
        });

        // POST straight to better-auth (like sign-in/email and
        // request-password-reset). BA always answers 200 and fires
        // onSendMagicLink (services/auth), which gates the send
        // (anti-enumeration, per-email throttle, blacklist, unknown-email CTA).
        // The success state below is intentional even for an unknown address —
        // nothing here reveals account existence.
        const res = await fetch('/api/auth/sign-in/magic-link', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          // metadata.lang rides BA's metadata channel through to
          // onSendMagicLink so the "no account" CTA (no DB user → no culture)
          // is rendered in the locale the visitor is actually using.
          body: JSON.stringify({
            email,
            callbackURL,
            metadata: { lang: intl.locale },
          }),
        });

        if (res.ok) {
          setSuccess(true);
          return;
        }

        setErrorMessage(intl.formatMessage(messages.genericError));
      } catch {
        setErrorMessage(intl.formatMessage(messages.genericError));
      } finally {
        setLoading(false);
      }
    },
    [email, agenda, redirect, invitation, intl],
  );

  if (success) {
    return (
      <VStack
        ref={successContainerRef}
        tabIndex={-1}
        gap="4"
        pb="5"
        align="stretch"
        role="status"
        aria-live="polite"
      >
        <Text>{intl.formatMessage(messages.successMessage)}</Text>
      </VStack>
    );
  }

  return (
    <chakra.form
      onSubmit={handleSubmit}
      aria-label={intl.formatMessage(messages.formTitle)}
    >
      <Text mb="4">{intl.formatMessage(messages.intro)}</Text>

      {errorMessage && (
        <MessageAlert status="error" mb="4">
          {errorMessage}
        </MessageAlert>
      )}

      <Field.Root required disabled={loading} mb="4">
        <Field.Label>
          {intl.formatMessage(messages.emailLabel)}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          ref={emailInputRef}
          id="magic-link-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder={intl.formatMessage(messages.emailPlaceholder)}
        />
      </Field.Root>

      <HStack gap="2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          flex="1"
          disabled={loading}
        >
          {intl.formatMessage(messages.cancelLabel)}
        </Button>
        <Button type="submit" colorPalette="blue" flex="1" loading={loading}>
          {intl.formatMessage(messages.submitLabel)}
        </Button>
      </HStack>
    </chakra.form>
  );
}
