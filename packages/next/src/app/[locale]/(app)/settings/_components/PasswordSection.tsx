'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Field, chakra } from '@openagenda/uikit';
import { PasswordInput } from '@openagenda/uikit/snippets';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';

type PasswordError = 'bad' | 'short' | 'long' | 'mismatch' | 'other';

const messages = defineMessages({
  title: {
    id: 'next.components.settings.Password.title',
    defaultMessage: 'Password',
  },
  modify: {
    id: 'next.components.settings.Password.modify',
    defaultMessage: 'Modify',
  },
  currentLabel: {
    id: 'next.components.settings.Password.currentLabel',
    defaultMessage: 'Current password',
  },
  newLabel: {
    id: 'next.components.settings.Password.newLabel',
    defaultMessage: 'New password',
  },
  confirmationLabel: {
    id: 'next.components.settings.Password.confirmationLabel',
    defaultMessage: 'Confirmation',
  },
  save: {
    id: 'next.components.settings.Password.save',
    defaultMessage: 'Save',
  },
  success: {
    id: 'next.components.settings.Password.success',
    defaultMessage: 'Your password has been updated successfully.',
  },
  badError: {
    id: 'next.components.settings.Password.badError',
    defaultMessage: 'Bad password',
  },
  shortError: {
    id: 'next.components.settings.Password.shortError',
    defaultMessage: 'Password is too short',
  },
  longError: {
    id: 'next.components.settings.Password.longError',
    defaultMessage: 'Password is too long',
  },
  mismatchError: {
    id: 'next.components.settings.Password.mismatchError',
    defaultMessage: 'Both passwords are not identical',
  },
  otherError: {
    id: 'next.components.settings.Password.otherError',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

const ERROR_MESSAGE: Record<
  PasswordError,
  (typeof messages)[keyof typeof messages]
> = {
  bad: messages.badError,
  short: messages.shortError,
  long: messages.longError,
  mismatch: messages.mismatchError,
  other: messages.otherError,
};

// better-auth /change-password error codes → our error keys (see the legacy
// mapChangePasswordError in user-apps).
function mapCode(code: string | undefined): PasswordError {
  switch (code) {
    case 'INVALID_PASSWORD':
    case 'CREDENTIAL_ACCOUNT_NOT_FOUND':
      return 'bad';
    case 'PASSWORD_TOO_SHORT':
      return 'short';
    case 'PASSWORD_TOO_LONG':
      return 'long';
    default:
      return 'other';
  }
}

export default function PasswordSection() {
  const intl = useIntl();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<PasswordError | null>(null);

  const reset = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmation('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    // better-auth does not check the confirmation, so validate it client-side
    // (matches the legacy form behaviour).
    if (newPassword !== confirmation) {
      setError('mismatch');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
          revokeOtherSessions: false,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        reset();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(mapCode(body?.code));
    } catch {
      setError('other');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccordionItem
      value="password"
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
      summary={
        <chakra.span color="fg.muted">
          {intl.formatMessage(messages.modify)}
        </chakra.span>
      }
    >
      <chakra.form onSubmit={handleSubmit} maxW="md">
        <Field.Root required disabled={saving} invalid={error === 'bad'} mb="4">
          <Field.Label>
            {intl.formatMessage(messages.currentLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            id="settings-currentPassword"
            name="currentPassword"
            autoComplete="new-password"
            value={oldPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setOldPassword(e.target.value);
              setError(null);
            }}
          />
          {error === 'bad' && (
            <Field.ErrorText>
              {intl.formatMessage(ERROR_MESSAGE.bad)}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root
          required
          disabled={saving}
          invalid={error === 'short' || error === 'long'}
          mb="4"
        >
          <Field.Label>
            {intl.formatMessage(messages.newLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            id="settings-newPassword"
            name="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
          />
          {(error === 'short' || error === 'long') && (
            <Field.ErrorText>
              {intl.formatMessage(ERROR_MESSAGE[error])}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root
          required
          disabled={saving}
          invalid={error === 'mismatch'}
          mb="4"
        >
          <Field.Label>
            {intl.formatMessage(messages.confirmationLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            id="settings-passwordConfirmation"
            name="passwordConfirmation"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmation(e.target.value);
              setError(null);
            }}
          />
          {error === 'mismatch' && (
            <Field.ErrorText>
              {intl.formatMessage(ERROR_MESSAGE.mismatch)}
            </Field.ErrorText>
          )}
        </Field.Root>

        {success && (
          <MessageAlert role="status" status="success" mb="4">
            {intl.formatMessage(messages.success)}
          </MessageAlert>
        )}
        {error === 'other' && (
          <MessageAlert role="alert" status="error" mb="4">
            {intl.formatMessage(ERROR_MESSAGE.other)}
          </MessageAlert>
        )}

        <Button
          type="submit"
          colorPalette="blue"
          loading={saving}
          disabled={!oldPassword || !newPassword || !confirmation}
        >
          {intl.formatMessage(messages.save)}
        </Button>
      </chakra.form>
    </AccordionItem>
  );
}
