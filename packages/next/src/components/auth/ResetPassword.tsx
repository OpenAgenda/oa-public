'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Field,
  Spinner,
  Text,
  VStack,
  chakra,
} from '@openagenda/uikit';
import MessageAlert from '@/src/components/MessageAlert';
import PasswordField from './PasswordField';

const messages = defineMessages({
  formTitle: {
    id: 'next.components.auth.ResetPassword.formTitle',
    defaultMessage: 'Reset your password',
  },
  intro: {
    id: 'next.components.auth.ResetPassword.intro',
    defaultMessage: 'Choose a new password for your OpenAgenda account.',
  },
  passwordLabel: {
    id: 'next.components.auth.ResetPassword.passwordLabel',
    defaultMessage: 'New password',
  },
  repeatLabel: {
    id: 'next.components.auth.ResetPassword.repeatLabel',
    defaultMessage: 'Repeat password',
  },
  submitLabel: {
    id: 'next.components.auth.ResetPassword.submitLabel',
    defaultMessage: 'Update password',
  },
  successHeading: {
    id: 'next.components.auth.ResetPassword.successHeading',
    defaultMessage: 'Password updated',
  },
  successMessage: {
    id: 'next.components.auth.ResetPassword.successMessage',
    defaultMessage: 'You can now sign in with your new password.',
  },
  invalidToken: {
    id: 'next.components.auth.ResetPassword.invalidToken',
    defaultMessage:
      'This reset link is invalid or has expired. Please request a new one.',
  },
  passwordsMustMatch: {
    id: 'next.components.auth.ResetPassword.passwordsMustMatch',
    defaultMessage: 'The two passwords do not match.',
  },
  passwordRequired: {
    id: 'next.components.auth.ResetPassword.passwordRequired',
    defaultMessage: 'A password must be defined.',
  },
  genericError: {
    id: 'next.components.auth.ResetPassword.genericError',
    defaultMessage: 'An error occurred. Please try again.',
  },
});

interface ResetPasswordProps {
  token: string | null;
}

export default function ResetPassword({ token }: ResetPasswordProps) {
  const intl = useIntl();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!password) {
        setErrorMessage(intl.formatMessage(messages.passwordRequired));
        return;
      }
      if (password !== repeat) {
        setErrorMessage(intl.formatMessage(messages.passwordsMustMatch));
        return;
      }
      if (!token) {
        setErrorMessage(intl.formatMessage(messages.invalidToken));
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ newPassword: password, token }),
        });
        if (res.ok) {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/auth/signin?msg=passwordUpdated';
          }, 1500);
          return;
        }
        const body = await res.json().catch(() => null);
        if (
          body?.code === 'INVALID_TOKEN' ||
          body?.code === 'TOKEN_EXPIRED' ||
          body?.code === 'USER_NOT_FOUND'
        ) {
          setErrorMessage(intl.formatMessage(messages.invalidToken));
          return;
        }
        setErrorMessage(
          body?.message ?? intl.formatMessage(messages.genericError),
        );
      } catch {
        setErrorMessage(intl.formatMessage(messages.genericError));
      } finally {
        setLoading(false);
      }
    },
    [intl, password, repeat, token],
  );

  if (success) {
    return (
      <VStack py="8" gap="4" role="status" aria-live="polite">
        <Text textAlign="center" fontWeight="bold">
          {intl.formatMessage(messages.successHeading)}
        </Text>
        <Text textAlign="center">
          {intl.formatMessage(messages.successMessage)}
        </Text>
        <Spinner size="md" />
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
        <MessageAlert role="alert" status="error" mb="4">
          {errorMessage}
        </MessageAlert>
      )}

      <PasswordField
        id="reset-password"
        name="password"
        label={intl.formatMessage(messages.passwordLabel)}
        value={password}
        onChange={setPassword}
        required
        disabled={loading}
        inputRef={passwordInputRef}
      />

      <Field.Root required disabled={loading} mb="4">
        <Field.Label>
          {intl.formatMessage(messages.repeatLabel)}
          <Field.RequiredIndicator />
        </Field.Label>
        <chakra.input
          id="reset-password-repeat"
          name="repeat"
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRepeat(e.target.value)
          }
          // Match Chakra's Input shape so the field looks consistent with the
          // rest of the form even though we use a raw input here (PasswordField
          // already encapsulates the password-with-strength widget; we just
          // need a plain confirmation field).
          borderWidth="1px"
          borderColor="border"
          borderRadius="md"
          px="3"
          py="2"
          w="full"
        />
      </Field.Root>

      <Button type="submit" w="full" loading={loading}>
        {intl.formatMessage(messages.submitLabel)}
      </Button>
    </chakra.form>
  );
}
