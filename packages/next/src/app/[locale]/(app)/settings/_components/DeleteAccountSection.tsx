'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ky, { isHTTPError } from 'ky';
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
      'Are you sure you want to delete your account permanently?\n\nYour agendas and events will remain online, you can delete them manually if you do not want to leave them online',
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
      await ky.delete('/users/me', {
        headers: { Authorization: `Basic ${password}` },
      });
      window.location.href = '/signout';
    } catch (err) {
      // ky throws HTTPError on a non-2xx response; a 403 means the password
      // was wrong, anything else is an unexpected failure.
      setError(isHTTPError(err) && err.response.status === 403 ? 'auth' : 'other');
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

        <Field.Root
          required
          disabled={loading}
          invalid={error === 'auth'}
          mb="4"
        >
          <Field.Label>
            {intl.formatMessage(messages.passwordLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            id="settings-delete-password"
            name="password"
            // new-password (not current-password) so the browser doesn't
            // autofill the saved site password into this confirmation field.
            autoComplete="new-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
          {error === 'auth' && (
            <Field.ErrorText>
              {intl.formatMessage(messages.authError)}
            </Field.ErrorText>
          )}
        </Field.Root>

        {error === 'other' && (
          <MessageAlert role="alert" status="error" mb="4">
            {intl.formatMessage(messages.otherError)}
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
