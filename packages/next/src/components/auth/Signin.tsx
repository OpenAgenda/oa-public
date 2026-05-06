'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Field,
  HStack,
  Link,
  Separator,
  Spinner,
  Text,
  VStack,
  chakra,
  Input,
} from '@openagenda/uikit';
import MessageAlert from '@/src/components/MessageAlert';
import LostPassword from './LostPassword';
import SignupComplete from './SignupComplete';

const messages = defineMessages({
  emailLabel: {
    id: 'next.components.auth.Signin.emailLabel',
    defaultMessage: 'Email',
  },
  emailPlaceholder: {
    id: 'next.components.auth.Signin.emailPlaceholder',
    defaultMessage: 'you@example.com',
  },
  passwordLabel: {
    id: 'next.components.auth.Signin.passwordLabel',
    defaultMessage: 'Password',
  },
  submitLabel: {
    id: 'next.components.auth.Signin.submitLabel',
    defaultMessage: 'Sign in',
  },
  or: {
    id: 'next.components.auth.Signin.or',
    defaultMessage: 'or',
  },
  googleLabel: {
    id: 'next.components.auth.Signin.googleLabel',
    defaultMessage: 'Sign in with Google',
  },
  facebookLabel: {
    id: 'next.components.auth.Signin.facebookLabel',
    defaultMessage: 'Sign in with Facebook',
  },
  formTitle: {
    id: 'next.components.auth.Signin.formTitle',
    defaultMessage: 'Sign in form',
  },
  genericError: {
    id: 'next.components.auth.Signin.genericError',
    defaultMessage: 'An error occurred. Please try again.',
  },
  signinSuccess: {
    id: 'next.components.auth.Signin.signinSuccess',
    defaultMessage: 'Authentication successful. Redirecting…',
  },
  noAccount: {
    id: 'next.components.auth.Signin.noAccount',
    defaultMessage: "Don't have an account yet?",
  },
  createAccount: {
    id: 'next.components.auth.Signin.createAccount',
    defaultMessage: 'Create one!',
  },
  forgotPassword: {
    id: 'next.components.auth.Signin.forgotPassword',
    defaultMessage: 'I forgot my password',
  },
  invalidCredentials: {
    id: 'next.components.auth.Signin.invalidCredentials',
    defaultMessage: 'The email or the password are incorrect.',
  },
  resetPassword: {
    id: 'next.components.auth.Signin.resetPassword',
    defaultMessage: 'Reset my password',
  },
  linkProviderGoogleNotice: {
    id: 'next.components.auth.Signin.linkProviderGoogleNotice',
    defaultMessage:
      'An OpenAgenda account already exists with this email. Confirm your password to link your Google account.',
  },
  linkProviderError: {
    id: 'next.components.auth.Signin.linkProviderError',
    defaultMessage: 'Linking failed. Please sign in with Google again.',
  },
});

interface SigninProps {
  defaultLoading?: boolean;
  defaultSuccess?: boolean;
  defaultInvalidCredentials?: boolean;
  defaultLostPassword?: boolean;
  agenda?: { slug: string; uid: string };
  redirect?: string;
  reloadOnSuccess?: boolean;
  redirectOnSuccess?: string;
  // Verified-linking flow (phase 4): when set, the user just came back from
  // an OAuth callback that hit BA's `account_not_linked` (existing OA user
  // matched by email but no `account` row for the provider). Showing a
  // banner + posting `linkProvider` along with the credentials lets the
  // /signin handler trigger /api/auth/link-social right after signin to
  // finalise the linking. Only `'google'` is supported (Facebook stays
  // strict — no verified linking, phase-out policy).
  linkProvider?: 'google';
  linkError?: boolean;
  defaultEmail?: string;
  onSuccess?: () => void;
  onViewChange?: (view: 'signin' | 'lost' | 'signup') => void;
  // Called when /signin returns `reason: 'activation_required'` (signin
  // attempt for an unverified account). The server has just resent the
  // verification email; the parent can switch to <SignupComplete> inline
  // instead of navigating to a separate page.
  onActivationRequired?: (params: { email: string; resendUrl: string }) => void;
}

export default function Signin({
  defaultLoading = false,
  defaultSuccess = false,
  defaultInvalidCredentials = false,
  defaultLostPassword = false,
  agenda,
  redirect,
  reloadOnSuccess = false,
  redirectOnSuccess,
  linkProvider,
  linkError = false,
  defaultEmail = '',
  onSuccess,
  onViewChange,
  onActivationRequired,
}: SigninProps) {
  const intl = useIntl();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  // Fallback when no parent supplied `onActivationRequired`: render
  // <SignupComplete> inline in place of the form.
  const [activationData, setActivationData] = useState<{
    email: string;
    resendUrl: string;
  } | null>(null);
  const [invalidCredentials, setInvalidCredentials] = useState(
    defaultInvalidCredentials,
  );
  const [loading, setLoading] = useState(defaultLoading);
  const [success, setSuccess] = useState(defaultSuccess);
  const [view, setView] = useState<'signin' | 'lost'>(
    defaultLostPassword ? 'lost' : 'signin',
  );
  const invalidCredentialsAlertRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const prevViewRef = useRef(view);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (invalidCredentials) {
      invalidCredentialsAlertRef.current?.focus();
    }
  }, [invalidCredentials]);

  useEffect(() => {
    if (prevViewRef.current === 'lost' && view === 'signin') {
      emailInputRef.current?.focus();
    }
    prevViewRef.current = view;
  }, [view]);

  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setMessage(null);
      setInvalidCredentials(false);
      setLoading(true);

      try {
        const url = redirect
          ? `/signin?${new URLSearchParams({ redirect }).toString()}`
          : '/signin';
        const body: Record<string, string> = { email, password };
        if (linkProvider) body.linkProvider = linkProvider;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(body),
        });

        const data = await res.json();

        if (data.reason === 'activation_required' && data.email) {
          const params = { email: data.email, resendUrl: data.resendUrl };
          if (onActivationRequired) {
            onActivationRequired(params);
          } else {
            setActivationData(params);
          }
          return;
        }

        if (data.success) {
          setSuccess(true);
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else if (redirectOnSuccess) {
              window.location.href = redirectOnSuccess;
            } else if (reloadOnSuccess || !data.redirect) {
              window.location.reload();
            } else {
              window.location.href = data.redirect;
            }
          }, 1000);
          return;
        }

        if (data.redirect) {
          window.location.href = data.redirect;
          return;
        }

        if (data.errors?.password) {
          setInvalidCredentials(true);
        } else if (data.errors) {
          setErrors(data.errors);
        }

        if (data.message) {
          setMessage(data.message);
        }
      } catch {
        setMessage(intl.formatMessage(messages.genericError));
      } finally {
        setLoading(false);
      }
    },
    [
      email,
      password,
      redirect,
      intl,
      reloadOnSuccess,
      redirectOnSuccess,
      onSuccess,
      onActivationRequired,
      linkProvider,
    ],
  );

  if (success) {
    return (
      <VStack py="8" gap="4" role="status" aria-live="polite">
        <Text textAlign="center">
          {intl.formatMessage(messages.signinSuccess)}
        </Text>
        <Spinner size="md" />
      </VStack>
    );
  }

  if (activationData) {
    return (
      <SignupComplete
        email={activationData.email}
        resendUrl={activationData.resendUrl}
      />
    );
  }

  if (view === 'lost') {
    return (
      <LostPassword defaultEmail={email} onCancel={() => setView('signin')} />
    );
  }

  return (
    <chakra.form
      onSubmit={handleSubmit}
      aria-label={intl.formatMessage(messages.formTitle)}
    >
      {linkProvider === 'google' && (
        <MessageAlert role="alert" status={linkError ? 'error' : 'info'} mb="4">
          {intl.formatMessage(
            linkError
              ? messages.linkProviderError
              : messages.linkProviderGoogleNotice,
          )}
        </MessageAlert>
      )}

      {message && (
        <MessageAlert role="alert" status="error" mb="4">
          {message}
        </MessageAlert>
      )}

      {invalidCredentials && (
        <MessageAlert
          ref={invalidCredentialsAlertRef}
          id="signin-invalid-credentials"
          tabIndex={-1}
          role="alert"
          status="error"
          mb="4"
          description={
            <Button
              variant="link"
              type="button"
              onClick={() => setView('lost')}
              color="primary.500"
            >
              {intl.formatMessage(messages.resetPassword)}
            </Button>
          }
        >
          {intl.formatMessage(messages.invalidCredentials)}
        </MessageAlert>
      )}

      <Field.Root
        required
        invalid={invalidCredentials || !!errors.email}
        disabled={loading}
        mb="4"
      >
        <Field.Label>
          {intl.formatMessage(messages.emailLabel)}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          ref={emailInputRef}
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder={intl.formatMessage(messages.emailPlaceholder)}
          aria-describedby={
            invalidCredentials ? 'signin-invalid-credentials' : undefined
          }
        />
        {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
      </Field.Root>

      <Field.Root
        required
        invalid={invalidCredentials || !!errors.password}
        disabled={loading}
        mb="4"
      >
        <Field.Label>
          {intl.formatMessage(messages.passwordLabel)}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          aria-describedby={
            invalidCredentials ? 'signin-invalid-credentials' : undefined
          }
        />
        {errors.password && (
          <Field.ErrorText>{errors.password}</Field.ErrorText>
        )}
        <Field.HelperText>
          <Button
            variant="link"
            type="button"
            onClick={() => setView('lost')}
            color="primary.500"
          >
            {intl.formatMessage(messages.forgotPassword)}
          </Button>
        </Field.HelperText>
      </Field.Root>

      <Button type="submit" colorPalette="blue" w="full" loading={loading}>
        {intl.formatMessage(messages.submitLabel)}
      </Button>

      {(!linkProvider || linkError) && (
        <>
          <HStack my="4">
            <Separator flex="1" aria-hidden="true" />
            <Text flexShrink="0" fontSize="sm" color="fg.muted">
              {intl.formatMessage(messages.or)}
            </Text>
            <Separator flex="1" aria-hidden="true" />
          </HStack>
          <Button asChild variant="outline" w="full">
            <a
              href={agenda ? `/${agenda.slug}/google/signin` : '/google/signin'}
            >
              {intl.formatMessage(messages.googleLabel)}
            </a>
          </Button>
          <Button asChild variant="outline" w="full" mt="2">
            <a
              href={
                agenda ? `/${agenda.slug}/facebook/signin` : '/facebook/signin'
              }
            >
              {intl.formatMessage(messages.facebookLabel)}
            </a>
          </Button>
        </>
      )}

      <Text mt="4" textAlign="center">
        {intl.formatMessage(messages.noAccount)}{' '}
        {onViewChange ? (
          <Button
            variant="link"
            type="button"
            onClick={() => onViewChange('signup')}
            color="primary.500"
          >
            {intl.formatMessage(messages.createAccount)}
          </Button>
        ) : (
          <Link
            href={agenda ? `/${agenda.slug}/signup` : '/signup'}
            color="primary.500"
          >
            {intl.formatMessage(messages.createAccount)}
          </Link>
        )}
      </Text>
    </chakra.form>
  );
}
