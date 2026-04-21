'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Alert,
  Button,
  Field,
  HStack,
  Input,
  Text,
  VStack,
  chakra,
} from '@openagenda/uikit';

const messages = defineMessages({
  intro: {
    id: 'next.components.auth.LostPassword.intro',
    defaultMessage:
      'You have an OpenAgenda account but you no longer know what the password is. Enter your email to receive a reset link in your inbox.',
  },
  emailLabel: {
    id: 'next.components.auth.LostPassword.emailLabel',
    defaultMessage: 'Email',
  },
  emailPlaceholder: {
    id: 'next.components.auth.LostPassword.emailPlaceholder',
    defaultMessage: 'you@example.com',
  },
  submitLabel: {
    id: 'next.components.auth.LostPassword.submitLabel',
    defaultMessage: 'Send the reset link',
  },
  cancelLabel: {
    id: 'next.components.auth.LostPassword.cancelLabel',
    defaultMessage: 'Cancel',
  },
  successMessage: {
    id: 'next.components.auth.LostPassword.successMessage',
    defaultMessage:
      "The reset link has been sent to the email you entered. Delivery may take a few minutes — check your inbox and your spam folder. If you don't receive the link, contact our support team.",
  },
  genericError: {
    id: 'next.components.auth.LostPassword.genericError',
    defaultMessage: 'An error occurred. Please try again.',
  },
  formTitle: {
    id: 'next.components.auth.LostPassword.formTitle',
    defaultMessage: 'Lost password form',
  },
});

interface LostPasswordProps {
  defaultEmail?: string;
  defaultSuccess?: boolean;
  defaultLoading?: boolean;
  onCancel: () => void;
}

export default function LostPassword({
  defaultEmail = '',
  defaultSuccess = false,
  defaultLoading = false,
  onCancel,
}: LostPasswordProps) {
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
        const res = await fetch('/password/lost', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ email }),
        });

        const data = await res.json();

        if (data.success) {
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
    [email, intl],
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
        <Alert.Root status="error" mb="4">
          <Alert.Indicator />
          <Alert.Title>{errorMessage}</Alert.Title>
        </Alert.Root>
      )}

      <Field.Root required disabled={loading} mb="4">
        <Field.Label>
          {intl.formatMessage(messages.emailLabel)}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          ref={emailInputRef}
          id="lost-password-email"
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
