'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Field, Text, chakra } from '@openagenda/uikit';
import { PasswordInput } from '@openagenda/uikit/snippets';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';

const messages = defineMessages({
  title: {
    id: 'next.components.settings.DeleteAccount.title',
    defaultMessage: 'Delete my account',
  },
  warning: {
    id: 'next.components.settings.DeleteAccount.warning',
    defaultMessage:
      'Are you sure you want to delete your account permanently?\n\nYour calendars and events will remain online, you can delete them manually if you do not want to leave them online',
  },
  passwordLabel: {
    id: 'next.components.settings.DeleteAccount.passwordLabel',
    defaultMessage: 'Type in your password to complete the operation',
  },
  submit: {
    id: 'next.components.settings.DeleteAccount.submit',
    defaultMessage: 'Delete',
  },
  authError: {
    id: 'next.components.settings.DeleteAccount.authError',
    defaultMessage: 'The submitted password is invalid. Please try again.',
  },
  otherError: {
    id: 'next.components.settings.DeleteAccount.otherError',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

export default function DeleteAccountSection() {
  const intl = useIntl();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'auth' | 'other' | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Mirrors the legacy AuthenticateAndConfirm flow: the cleartext password
      // is sent as a `Basic` credential and the account is removed in one
      // request. A 403 means the password was wrong; success ends the session
      // via the cibul-node /signout route.
      const res = await fetch('/users/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${password}`,
        },
      });
      if (res.ok) {
        window.location.href = '/signout';
        return;
      }
      setError(res.status === 403 ? 'auth' : 'other');
    } catch {
      setError('other');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccordionItem
      value="deleteAccount"
      title={
        <chakra.span fontWeight="medium" color="red.solid">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
    >
      <chakra.form onSubmit={handleSubmit} maxW="md">
        <Text mb="4" whiteSpace="pre-line">
          {intl.formatMessage(messages.warning)}
        </Text>

        <Field.Root required disabled={loading} mb="4">
          <Field.Label>
            {intl.formatMessage(messages.passwordLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            id="settings-delete-password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
        </Field.Root>

        {error && (
          <MessageAlert role="alert" status="error" mb="4">
            {intl.formatMessage(
              error === 'auth' ? messages.authError : messages.otherError,
            )}
          </MessageAlert>
        )}

        <Button
          type="submit"
          colorPalette="red"
          loading={loading}
          disabled={!password}
        >
          {intl.formatMessage(messages.submit)}
        </Button>
      </chakra.form>
    </AccordionItem>
  );
}
