'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Field, Input, chakra } from '@openagenda/uikit';
import { PasswordInput } from '@openagenda/uikit/snippets';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import type { SettingsUser } from './types';

const messages = defineMessages({
  title: {
    id: 'next.components.settings.Email.title',
    defaultMessage: 'Email',
  },
  newEmailLabel: {
    id: 'next.components.settings.Email.newEmailLabel',
    defaultMessage: 'New e-mail address',
  },
  passwordLabel: {
    id: 'next.components.settings.Email.passwordLabel',
    defaultMessage: 'Current password',
  },
  save: {
    id: 'next.components.settings.Email.save',
    defaultMessage: 'Save',
  },
  success: {
    id: 'next.components.settings.Email.success',
    defaultMessage:
      'A validation link has been sent to your new email address.',
  },
  authError: {
    id: 'next.components.settings.Email.authError',
    defaultMessage: 'The submitted password is invalid. Please try again.',
  },
  takenError: {
    id: 'next.components.settings.Email.takenError',
    defaultMessage: 'This email address is already used',
  },
  otherError: {
    id: 'next.components.settings.Email.otherError',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

interface EmailSectionProps {
  user: SettingsUser;
}

export default function EmailSection({ user }: EmailSectionProps) {
  const intl = useIntl();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<'auth' | 'taken' | 'other' | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      // Mirrors the legacy AuthenticateAndConfirm flow: the cleartext password
      // rides as a `Basic` credential and the new address is requested in one
      // PATCH. The backend emails a validation link — the address only changes
      // once that link is followed, so there's nothing to mutate here.
      const res = await fetch('/users/me/requestChangeEmail', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${password}`,
        },
        body: JSON.stringify({ newEmail }),
      });
      if (res.ok) {
        setSuccess(true);
        setNewEmail('');
        setPassword('');
        return;
      }
      if (res.status === 403) {
        setError('auth');
      } else {
        // Only claim "already used" when the backend actually reports a
        // uniqueness conflict (checkUnicity → BadRequest 'Already exist');
        // anything else is a generic failure.
        const body = await res.json().catch(() => ({}));
        const message = typeof body?.message === 'string' ? body.message : '';
        setError(/exist|taken|in use/i.test(message) ? 'taken' : 'other');
      }
    } catch {
      setError('other');
    } finally {
      setSaving(false);
    }
  };

  const errorMessage =
    error === 'auth'
      ? messages.authError
      : error === 'taken'
        ? messages.takenError
        : messages.otherError;

  return (
    <AccordionItem
      value="email"
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
      summary={
        user.email ? (
          <chakra.span color="fg.muted">{user.email}</chakra.span>
        ) : undefined
      }
    >
      <chakra.form onSubmit={handleSubmit} maxW="md">
        <Field.Root required disabled={saving} mb="4">
          <Field.Label>
            {intl.formatMessage(messages.newEmailLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            id="settings-newEmail"
            name="newEmail"
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewEmail(e.target.value);
              setSuccess(false);
              setError(null);
            }}
          />
        </Field.Root>

        <Field.Root required disabled={saving} mb="4">
          <Field.Label>
            {intl.formatMessage(messages.passwordLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            id="settings-newEmail-password"
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
        </Field.Root>

        {success && (
          <MessageAlert role="status" status="success" mb="4">
            {intl.formatMessage(messages.success)}
          </MessageAlert>
        )}
        {error && (
          <MessageAlert role="alert" status="error" mb="4">
            {intl.formatMessage(errorMessage)}
          </MessageAlert>
        )}

        <Button
          type="submit"
          colorPalette="blue"
          loading={saving}
          disabled={!newEmail || !password}
        >
          {intl.formatMessage(messages.save)}
        </Button>
      </chakra.form>
    </AccordionItem>
  );
}
