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
import computePostSignInRedirect, {
  decodeBase64Redirect,
} from '@/src/lib/computePostSignInRedirect';
import MessageAlert from '@/src/components/MessageAlert';
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
  // Initial invitation token forwarded to <SignupComplete> via the
  // onActivationRequired callback so the verification email's callbackURL
  // routes through /post-activate when relevant.
  invitation?: string;
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
  // Called when BA returns `EMAIL_NOT_VERIFIED` (signin attempt for an
  // unverified account). Parent must swap to <SignupComplete> — Signin no
  // longer ships a built-in verify panel, so this callback is required.
  onActivationRequired: (params: {
    email: string;
    callbackURL?: string;
  }) => void;
}

export default function Signin({
  defaultLoading = false,
  defaultSuccess = false,
  defaultInvalidCredentials = false,
  defaultLostPassword = false,
  invitation,
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
        // Step 1: BA-native sign-in. Returns 200 + Set-Cookie on success;
        // 401/403 with a `code` field on failure (`INVALID_EMAIL_OR_PASSWORD`,
        // `EMAIL_NOT_VERIFIED`, …).
        const signinRes = await fetch('/api/auth/sign-in/email', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        // Drain the body even on failure so the browser commits Set-Cookie
        // before the next fetch (verified-linking flow).
        const signinBody = await signinRes
          .clone()
          .json()
          .catch(() => null);

        if (!signinRes.ok) {
          const code = signinBody?.code;
          // BA's `requireEmailVerification: true` flag rejects unverified
          // signups with FORBIDDEN/EMAIL_NOT_VERIFIED. Defer to the parent so
          // it can swap to <SignupComplete> at the page/dialog level — the
          // built-in inline verify panel was retired in favour of the
          // parent-driven activation flow.
          if (code === 'EMAIL_NOT_VERIFIED' && email) {
            // Mirror the post-activate redirect logic from the legacy
            // computePostActivateRedirect.js: route through
            // /post-activate?invitation=…&next=… when an invitation token is
            // present so it can be applied after BA's auto-signin redirect.
            let baseRedirect = '/home';
            if (redirect) {
              const safe = decodeBase64Redirect(redirect);
              if (safe) baseRedirect = safe;
            } else if (agenda?.slug) {
              baseRedirect = `/${agenda.slug}/contribute`;
            }
            const callbackURL = invitation
              ? `/post-activate?${new URLSearchParams({
                  invitation,
                  next: baseRedirect,
                }).toString()}`
              : baseRedirect;
            onActivationRequired({ email, callbackURL });
            return;
          }
          if (code === 'INVALID_EMAIL_OR_PASSWORD') {
            setInvalidCredentials(true);
            return;
          }
          // Other BA error codes (RATE_LIMITED, USER_NOT_FOUND, etc.) — surface
          // the BA-provided message when available, otherwise fall back to the
          // generic error. Avoid catch-all `signinBody?.code` truthy checks
          // that misleadingly show "invalid credentials" for unrelated codes.
          setMessage(
            signinBody?.message ?? intl.formatMessage(messages.genericError),
          );
          return;
        }

        // Step 2 — verified-linking flow (option A in the migration plan).
        // The first fetch posted Set-Cookie, the BA session is now active in
        // the browser. Trigger /api/auth/link-social, which validates the
        // session and returns an authorization URL we follow to Google.
        if (linkProvider === 'google') {
          const linkErrorRedirect =
            '/auth/signin?linkProvider=google&linkError=1';
          try {
            const linkRes = await fetch('/api/auth/link-social', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                provider: 'google',
                callbackURL: '/home',
                errorCallbackURL: linkErrorRedirect,
              }),
            });
            const linkBody = await linkRes.json().catch(() => null);
            if (linkRes.ok && linkBody?.url) {
              window.location.href = linkBody.url;
              return;
            }
          } catch {
            // fall through to error redirect below
          }
          window.location.href = linkErrorRedirect;
          return;
        }

        // Step 2 — regular signin: compute the same redirect the legacy
        // server-side handler used to emit, then navigate.
        const target =
          redirectOnSuccess ??
          computePostSignInRedirect({
            redirectParam: redirect,
            agendaSlug: agenda?.slug,
          });

        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (redirectOnSuccess) {
            window.location.href = redirectOnSuccess;
          } else if (reloadOnSuccess) {
            window.location.reload();
          } else {
            window.location.href = target;
          }
        }, 1000);
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
      invitation,
      intl,
      reloadOnSuccess,
      redirectOnSuccess,
      onSuccess,
      onActivationRequired,
      linkProvider,
      agenda,
    ],
  );

  // OAuth flow trigger. BA's POST /api/auth/sign-in/social returns
  // `{ url, redirect: true }` with the provider authorization URL — we navigate
  // to it. Errors fall back to a generic message; the verified-linking
  // (`account_not_linked`) case is handled server-side by the BA after-hook
  // on `/callback/:id` which redirects to `/auth/signin?linkProvider=google`.
  const startSocial = useCallback(
    async (provider: 'google' | 'facebook') => {
      setMessage(null);
      setLoading(true);
      try {
        const callbackURL = computePostSignInRedirect({
          redirectParam: redirect,
          agendaSlug: agenda?.slug,
        });
        const body: Record<string, string> = { provider, callbackURL };
        if (provider === 'google') {
          body.errorCallbackURL = '/auth/signin?linkProvider=google';
        }
        const res = await fetch('/api/auth/sign-in/social', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          window.location.href = data.url;
          return;
        }
        setMessage(intl.formatMessage(messages.genericError));
      } catch {
        setMessage(intl.formatMessage(messages.genericError));
      } finally {
        setLoading(false);
      }
    },
    [redirect, agenda, intl],
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
          <Button
            type="button"
            variant="outline"
            w="full"
            onClick={() => startSocial('google')}
            disabled={loading}
          >
            {intl.formatMessage(messages.googleLabel)}
          </Button>
          <Button
            type="button"
            variant="outline"
            w="full"
            mt="2"
            onClick={() => startSocial('facebook')}
            disabled={loading}
          >
            {intl.formatMessage(messages.facebookLabel)}
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
            href={
              agenda
                ? `/auth/signup?redirect=${btoa(`/${agenda.slug}/contribute`)}`
                : '/auth/signup'
            }
            color="primary.500"
          >
            {intl.formatMessage(messages.createAccount)}
          </Link>
        )}
      </Text>
    </chakra.form>
  );
}
