'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Field, Input, Link, Text, chakra } from '@openagenda/uikit';
import { PasswordInput } from '@openagenda/uikit/snippets';
import AccordionItem from '@/src/components/AccordionItem';
import MessageAlert from '@/src/components/MessageAlert';
import type { SettingsUser } from './types';

// Facebook sign-in is being phased out. This is a one-way migration, not a
// toggle: the user picks an email + password, the backend mails a confirmation
// link to that address, and following the link unlinks Facebook for good. The
// flow mirrors the legacy user-apps UnlinkFacebookSettings, hitting the same
// `PATCH /users/me/requestUnlinkFacebook` endpoint.

type UFError = 'required' | 'weak' | 'same' | 'mismatch' | 'taken' | 'other';

const messages = defineMessages({
  title: {
    id: 'next.components.settings.UnlinkFacebook.title',
    defaultMessage: 'Facebook',
  },
  summary: {
    id: 'next.components.settings.UnlinkFacebook.summary',
    defaultMessage: 'Unlink Facebook',
  },
  intro: {
    id: 'next.components.settings.UnlinkFacebook.intro',
    defaultMessage:
      'Facebook sign-in is being phased out. Choose an email and password to keep using your account, and we’ll send a confirmation link to that address. Clicking the link will unlink Facebook for good.',
  },
  emailLabel: {
    id: 'next.components.settings.UnlinkFacebook.emailLabel',
    defaultMessage: 'Email',
  },
  useAccountEmail: {
    id: 'next.components.settings.UnlinkFacebook.useAccountEmail',
    defaultMessage: 'Use my account email ({email})',
  },
  passwordLabel: {
    id: 'next.components.settings.UnlinkFacebook.passwordLabel',
    defaultMessage: 'New password',
  },
  confirmationLabel: {
    id: 'next.components.settings.UnlinkFacebook.confirmationLabel',
    defaultMessage: 'Confirmation',
  },
  submit: {
    id: 'next.components.settings.UnlinkFacebook.submit',
    defaultMessage: 'Send confirmation email',
  },
  sentTitle: {
    id: 'next.components.settings.UnlinkFacebook.sentTitle',
    defaultMessage: 'Check your inbox',
  },
  sentInstructions: {
    id: 'next.components.settings.UnlinkFacebook.sentInstructions',
    defaultMessage:
      'We sent a confirmation link to {email}. Click it to complete the migration.',
  },
  resendHint: {
    id: 'next.components.settings.UnlinkFacebook.resendHint',
    defaultMessage: 'Didn’t receive it? Submit the form again to resend.',
  },
  back: {
    id: 'next.components.settings.UnlinkFacebook.back',
    defaultMessage: 'Modify',
  },
  requiredError: {
    id: 'next.components.settings.UnlinkFacebook.requiredError',
    defaultMessage: 'A password must be defined',
  },
  weakError: {
    id: 'next.components.settings.UnlinkFacebook.weakError',
    defaultMessage: 'Password is not strong enough',
  },
  sameError: {
    id: 'next.components.settings.UnlinkFacebook.sameError',
    defaultMessage: 'Password must be different from your name and email',
  },
  mismatchError: {
    id: 'next.components.settings.UnlinkFacebook.mismatchError',
    defaultMessage: 'Both passwords are not identical',
  },
  takenError: {
    id: 'next.components.settings.UnlinkFacebook.takenError',
    defaultMessage: 'This email address is already used',
  },
  otherError: {
    id: 'next.components.settings.UnlinkFacebook.otherError',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
});

const ERROR_MESSAGE: Record<UFError, (typeof messages)[keyof typeof messages]> =
  {
    required: messages.requiredError,
    weak: messages.weakError,
    same: messages.sameError,
    mismatch: messages.mismatchError,
    taken: messages.takenError,
    other: messages.otherError,
  };

// `validatePassword` throws BadRequest({ info: { errors } }) with codes
// passwordRequired/SameAsIdentifier/TooWeak/NotEqual — but the /users error
// handler (plugApp.js) flattens `info.errors` to the ROOT of the JSON body
// (`{ name, message, code, errors }`), so read `body.errors`, not `body.info`.
function mapErrorBody(body: {
  errors?: { code?: string }[];
  message?: string;
}): UFError {
  const codes = Array.isArray(body?.errors)
    ? body.errors.map((e) => e.code)
    : [];
  if (codes.includes('passwordRequired')) return 'required';
  if (codes.includes('passwordSameAsIdentifier')) return 'same';
  if (codes.includes('passwordTooWeak')) return 'weak';
  if (codes.includes('passwordNotEqual')) return 'mismatch';
  // checkUnicity rejects a taken address with a BadRequest 'Already exist'.
  if (/exist|taken|in use/i.test(body?.message ?? '')) return 'taken';
  return 'other';
}

interface UnlinkFacebookSectionProps {
  user: SettingsUser;
}

export default function UnlinkFacebookSection({
  user,
}: UnlinkFacebookSectionProps) {
  const intl = useIntl();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<UFError | null>(null);

  // Facebook-linked accounts only. `facebookUid` is the authoritative gate (the
  // backend rejects the migration with `notFacebookAccount` otherwise); the
  // settings page fetches the detailed `/users/me`, so it's on `user` directly.
  if (!user.facebookUid) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // The backend checks this too, but matching client-side keeps the message
    // immediate (mirrors the legacy form).
    if (password !== confirmation) {
      setError('mismatch');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/users/me/requestUnlinkFacebook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, repeat: confirmation }),
      });
      if (res.ok) {
        setSentTo(email);
        setPassword('');
        setConfirmation('');
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(mapErrorBody(body));
    } catch {
      setError('other');
    } finally {
      setSaving(false);
    }
  };

  const showUseAccountEmail = Boolean(user.email) && email !== user.email;

  return (
    <AccordionItem
      value="unlinkFacebook"
      title={
        <chakra.span fontWeight="medium">
          {intl.formatMessage(messages.title)}
        </chakra.span>
      }
      summary={
        <chakra.span color="fg.muted">
          {intl.formatMessage(messages.summary)}
        </chakra.span>
      }
    >
      {sentTo ? (
        <chakra.div maxW="md">
          <MessageAlert role="status" status="success" mb="4">
            <chakra.div>
              <Text fontWeight="medium" mb="1">
                {intl.formatMessage(messages.sentTitle)}
              </Text>
              <Text>
                {intl.formatMessage(messages.sentInstructions, {
                  email: sentTo,
                })}
              </Text>
            </chakra.div>
          </MessageAlert>
          <Text color="fg.muted" fontSize="sm" mb="4">
            {intl.formatMessage(messages.resendHint)}
          </Text>
          <Button variant="outline" onClick={() => setSentTo(null)}>
            {intl.formatMessage(messages.back)}
          </Button>
        </chakra.div>
      ) : (
        <chakra.form onSubmit={handleSubmit} maxW="md">
          <Text mb="4">{intl.formatMessage(messages.intro)}</Text>

          <Field.Root
            required
            disabled={saving}
            invalid={error === 'taken'}
            mb="4"
          >
            <Field.Label>
              {intl.formatMessage(messages.emailLabel)}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              id="settings-unlinkFacebook-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
            {error === 'taken' && (
              <Field.ErrorText>
                {intl.formatMessage(messages.takenError)}
              </Field.ErrorText>
            )}
            {showUseAccountEmail && (
              <Field.HelperText>
                <Link asChild fontSize="sm">
                  <button
                    type="button"
                    onClick={() => setEmail(user.email ?? '')}
                  >
                    {intl.formatMessage(messages.useAccountEmail, {
                      email: user.email,
                    })}
                  </button>
                </Link>
              </Field.HelperText>
            )}
          </Field.Root>

          <Field.Root
            required
            disabled={saving}
            invalid={
              error === 'required' || error === 'weak' || error === 'same'
            }
            mb="4"
          >
            <Field.Label>
              {intl.formatMessage(messages.passwordLabel)}
              <Field.RequiredIndicator />
            </Field.Label>
            <PasswordInput
              id="settings-unlinkFacebook-password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            {(error === 'required' ||
              error === 'weak' ||
              error === 'same') && (
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
              id="settings-unlinkFacebook-confirmation"
              name="confirmation"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConfirmation(e.target.value);
                setError(null);
              }}
            />
            {error === 'mismatch' && (
              <Field.ErrorText>
                {intl.formatMessage(messages.mismatchError)}
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
            colorPalette="blue"
            loading={saving}
            disabled={!email || !password || !confirmation}
          >
            {intl.formatMessage(messages.submit)}
          </Button>
        </chakra.form>
      )}
    </AccordionItem>
  );
}
