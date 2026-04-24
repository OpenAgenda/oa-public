'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Alert,
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
import LostPassword from './LostPassword';

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
  formTitle: {
    id: 'next.components.auth.Signin.formTitle',
    defaultMessage: 'Sign in form',
  },
  lostPasswordTitle: {
    id: 'next.components.auth.Signin.lostPasswordTitle',
    defaultMessage: 'Lost password form',
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
  whereIsFacebook: {
    id: 'next.components.auth.Signin.whereIsFacebook',
    defaultMessage: 'Where did my Facebook connect button go?',
  },
});

interface SigninProps {
  defaultLoading?: boolean;
  defaultSuccess?: boolean;
  defaultInvalidCredentials?: boolean;
  defaultLostPassword?: boolean;
  agenda?: { slug: string; uid: string };
  reloadOnSuccess?: boolean;
  redirectOnSuccess?: string;
  onSuccess?: () => void;
  onViewChange?: (view: 'signin' | 'lost') => void;
}

export default function Signin({
  defaultLoading = false,
  defaultSuccess = false,
  defaultInvalidCredentials = false,
  defaultLostPassword = false,
  agenda,
  reloadOnSuccess = false,
  redirectOnSuccess,
  onSuccess,
  onViewChange,
}: SigninProps) {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
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
  const [viewAnnouncement, setViewAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    if (invalidCredentials) {
      invalidCredentialsAlertRef.current?.focus();
    }
  }, [invalidCredentials]);

  useEffect(() => {
    if (prevViewRef.current !== view) {
      setViewAnnouncement(
        intl.formatMessage(
          view === 'lost' ? messages.lostPasswordTitle : messages.formTitle,
        ),
      );
      if (prevViewRef.current === 'lost' && view === 'signin') {
        emailInputRef.current?.focus();
      }
    }
    prevViewRef.current = view;
  }, [view, intl]);

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
        const res = await fetch('/signin', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ email, password }),
        });

        const data = await res.json();

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
    [email, password, intl, reloadOnSuccess, redirectOnSuccess, onSuccess],
  );

  const liveAnnouncement = (
    <chakra.span srOnly role="status" aria-live="polite">
      {viewAnnouncement}
    </chakra.span>
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

  if (view === 'lost') {
    return (
      <>
        {liveAnnouncement}
        <LostPassword defaultEmail={email} onCancel={() => setView('signin')} />
      </>
    );
  }

  return (
    <chakra.form
      onSubmit={handleSubmit}
      aria-label={intl.formatMessage(messages.formTitle)}
    >
      {liveAnnouncement}
      {message && (
        <Alert.Root status="error" mb="4">
          <Alert.Indicator />
          <Alert.Title>{message}</Alert.Title>
        </Alert.Root>
      )}

      {invalidCredentials && (
        <Alert.Root
          ref={invalidCredentialsAlertRef}
          id="signin-invalid-credentials"
          tabIndex={-1}
          status="error"
          mb="4"
        >
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {intl.formatMessage(messages.invalidCredentials)}
            </Alert.Title>
            <Alert.Description>
              <Button
                variant="link"
                type="button"
                onClick={() => setView('lost')}
                color="primary.500"
              >
                {intl.formatMessage(messages.resetPassword)}
              </Button>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
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

      <HStack my="4">
        <Separator flex="1" aria-hidden="true" />
        <Text flexShrink="0" fontSize="sm" color="fg.muted">
          {intl.formatMessage(messages.or)}
        </Text>
        <Separator flex="1" aria-hidden="true" />
      </HStack>
      <Button asChild variant="outline" w="full">
        <a href={agenda ? `/${agenda.slug}/google/signin` : '/google/signin'}>
          {intl.formatMessage(messages.googleLabel)}
        </a>
      </Button>
      <Text mt="2" textAlign="center" fontSize="sm">
        <Link
          href={agenda ? `/${agenda.slug}/signin` : '/signin'}
          color="primary.500"
        >
          {intl.formatMessage(messages.whereIsFacebook)}
        </Link>
      </Text>

      <Text mt="4" textAlign="center">
        {intl.formatMessage(messages.noAccount)}{' '}
        <Link
          href={agenda ? `/${agenda.slug}/signup` : '/signup'}
          color="primary.500"
        >
          {intl.formatMessage(messages.createAccount)}
        </Link>
      </Text>
    </chakra.form>
  );
}
