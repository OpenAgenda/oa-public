'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Box,
  Button,
  Field,
  HStack,
  Input,
  Link,
  NativeSelect,
  Separator,
  Spinner,
  Text,
  VStack,
  chakra,
} from '@openagenda/uikit';
import { decodeBase64Redirect } from '@/src/lib/computePostSignInRedirect';
import MessageAlert from '@/src/components/MessageAlert';
import PasswordField from './PasswordField';
import CaptchaWidget, { type CaptchaProvider } from './captcha/CaptchaWidget';

const messages = defineMessages({
  formTitle: {
    id: 'next.components.auth.Signup.formTitle',
    defaultMessage: 'Sign up form',
  },
  fullNameLabel: {
    id: 'next.components.auth.Signup.fullNameLabel',
    defaultMessage: 'Username',
  },
  fullNameHelp: {
    id: 'next.components.auth.Signup.fullNameHelp',
    defaultMessage:
      'Your username will be visible to administrators of the calendars you contribute to.',
  },
  fullNameLearnMore: {
    id: 'next.components.auth.Signup.fullNameLearnMore',
    defaultMessage: 'Read more',
  },
  emailLabel: {
    id: 'next.components.auth.Signup.emailLabel',
    defaultMessage: 'Email',
  },
  emailPlaceholder: {
    id: 'next.components.auth.Signup.emailPlaceholder',
    defaultMessage: 'you@example.com',
  },
  passwordLabel: {
    id: 'next.components.auth.Signup.passwordLabel',
    defaultMessage: 'Password',
  },
  repeatLabel: {
    id: 'next.components.auth.Signup.repeatLabel',
    defaultMessage: 'Repeat password',
  },
  cultureLabel: {
    id: 'next.components.auth.Signup.cultureLabel',
    defaultMessage: 'Language',
  },
  agree: {
    id: 'next.components.auth.Signup.agree',
    defaultMessage:
      'By creating an account you agree to the <terms>Terms of Use</terms> and to the <policy>Privacy Policy</policy>.',
  },
  submitLabel: {
    id: 'next.components.auth.Signup.submitLabel',
    defaultMessage: 'Accept and create the account',
  },
  or: {
    id: 'next.components.auth.Signup.or',
    defaultMessage: 'or',
  },
  googleLabel: {
    id: 'next.components.auth.Signup.googleLabel',
    defaultMessage: 'Sign up with Google',
  },
  alreadyHaveAccount: {
    id: 'next.components.auth.Signup.alreadyHaveAccount',
    defaultMessage: 'Already have an account?',
  },
  hasAccount: {
    id: 'next.components.auth.Signup.hasAccount',
    defaultMessage: 'Have you already used OpenAgenda?',
  },
  signinLink: {
    id: 'next.components.auth.Signup.signinLink',
    defaultMessage: 'Sign in',
  },
  signupSuccess: {
    id: 'next.components.auth.Signup.signupSuccess',
    defaultMessage:
      'Account created. Check your inbox to verify your email address.',
  },
  genericError: {
    id: 'next.components.auth.Signup.genericError',
    defaultMessage: 'An error occurred. Please try again.',
  },
  fullNameRequired: {
    id: 'next.components.auth.Signup.errors.fullNameRequired',
    defaultMessage: 'This field cannot be empty',
  },
  fullNameTooLong: {
    id: 'next.components.auth.Signup.errors.fullNameTooLong',
    defaultMessage: 'The username must not exceed 50 characters',
  },
  emailInvalid: {
    id: 'next.components.auth.Signup.errors.emailInvalid',
    defaultMessage: 'The email is not valid',
  },
  emailUsed: {
    id: 'next.components.auth.Signup.errors.emailUsed',
    defaultMessage: 'This email is already in use',
  },
  passwordRequired: {
    id: 'next.components.auth.Signup.errors.passwordRequired',
    defaultMessage: 'A password must be defined',
  },
  passwordTooShort: {
    id: 'next.components.auth.Signup.errors.passwordTooShort',
    defaultMessage: 'Password is too short',
  },
  passwordTooWeak: {
    id: 'next.components.auth.Signup.errors.passwordTooWeak',
    defaultMessage: 'Password is too weak',
  },
  passwordIsSameAs: {
    id: 'next.components.auth.Signup.errors.passwordIsSameAs',
    defaultMessage: 'Password must be different from your name or email',
  },
  repeatNotEqual: {
    id: 'next.components.auth.Signup.errors.repeatNotEqual',
    defaultMessage: 'The passwords are not identical',
  },
  captchaTryAgain: {
    id: 'next.components.auth.Signup.errors.captchaTryAgain',
    defaultMessage: 'Captcha verification failed. Please try again.',
  },
  captchaRequired: {
    id: 'next.components.auth.Signup.errors.captchaRequired',
    defaultMessage: 'The captcha must be completed',
  },
  captchaExpired: {
    id: 'next.components.auth.Signup.errors.captchaExpired',
    defaultMessage: 'The captcha has expired. Please complete it again.',
  },
  opensNewWindow: {
    id: 'next.components.auth.Signup.opensNewWindow',
    defaultMessage: '(opens in a new window)',
  },
});

const SUPPORTED_CULTURES = ['fr', 'en', 'de', 'es', 'br', 'it', 'oc'] as const;
type Culture = (typeof SUPPORTED_CULTURES)[number];

const CULTURE_OPTIONS: { value: Culture; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'br', label: 'Brezhoneg' },
  { value: 'it', label: 'Italiano' },
  { value: 'oc', label: 'Occitan' },
];

const SERVER_ERROR_TO_MESSAGE: Record<string, keyof typeof messages> = {
  fieldCannotBeEmpty: 'fullNameRequired',
  fullNameTooLong: 'fullNameTooLong',
  invalidEmail: 'emailInvalid',
  usedEmail: 'emailUsed',
  passwordRequired: 'passwordRequired',
  passwordTooShort: 'passwordTooShort',
  tooWeak: 'passwordTooWeak',
  isSameAs: 'passwordIsSameAs',
  passwordNotEqual: 'repeatNotEqual',
  captchaTryAgain: 'captchaTryAgain',
  captchaRequired: 'captchaRequired',
};

function pickCultureFromLocale(locale: string): Culture {
  const head = locale.toLowerCase().split('-')[0] as Culture;
  return SUPPORTED_CULTURES.includes(head) ? head : 'fr';
}

interface SignupProps {
  defaultLoading?: boolean;
  defaultSuccess?: boolean;
  defaultEmail?: string;
  defaultFullName?: string;
  agenda?: { slug: string; uid: string };
  invitation?: string;
  redirect?: string;
  mtCaptchaEnabled?: boolean;
  mtCaptchaSiteKey?: string;
  captchaProvider?: CaptchaProvider;
  reloadOnSuccess?: boolean;
  redirectOnSuccess?: string;
  onSuccess?: () => void;
  onSignupComplete?: (params: { email: string; callbackURL?: string }) => void;
  onViewChange?: (view: 'signin' | 'lost' | 'signup') => void;
}

export default function Signup({
  defaultLoading = false,
  defaultSuccess = false,
  defaultEmail = '',
  defaultFullName = '',
  agenda,
  invitation,
  redirect,
  mtCaptchaEnabled = false,
  mtCaptchaSiteKey,
  captchaProvider = 'mtcaptcha',
  reloadOnSuccess = false,
  redirectOnSuccess,
  onSuccess,
  onSignupComplete,
  onViewChange,
}: SignupProps) {
  const intl = useIntl();
  const [fullName, setFullName] = useState(defaultFullName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [culture, setCulture] = useState<Culture>(() =>
    pickCultureFromLocale(intl.locale),
  );
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaExpired, setCaptchaExpired] = useState(false);
  const [captchaExpiredCount, setCaptchaExpiredCount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(defaultLoading);
  const [success, setSuccess] = useState(defaultSuccess);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const repeatInputRef = useRef<HTMLInputElement>(null);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const messageAlertRef = useRef<HTMLDivElement>(null);

  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
    if (token) setCaptchaExpired(false);
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaExpired(true);
    setCaptchaExpiredCount((c) => c + 1);
  }, []);

  useEffect(() => {
    fullNameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (message) {
      messageAlertRef.current?.focus();
      return;
    }
    const fieldOrder: [
      string,
      React.RefObject<HTMLInputElement | HTMLDivElement | null>,
    ][] = [
      ['fullName', fullNameInputRef],
      ['email', emailInputRef],
      ['password', passwordInputRef],
      ['repeat', repeatInputRef],
      ['captcha', captchaContainerRef],
    ];
    for (const [field, ref] of fieldOrder) {
      if (errors[field]) {
        ref.current?.focus();
        return;
      }
    }
  }, [errors, message]);

  const mapErrors = useCallback(
    (raw: Record<string, string> | undefined): Record<string, string> => {
      if (!raw) return {};
      const out: Record<string, string> = {};
      for (const [field, code] of Object.entries(raw)) {
        const messageKey = SERVER_ERROR_TO_MESSAGE[code];
        out[field] = messageKey
          ? intl.formatMessage(messages[messageKey])
          : code;
      }
      return out;
    },
    [intl],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setMessage(null);
      setLoading(true);

      try {
        // Lightweight client-side guard: BA's `validateSignUp` enforces the
        // same rule server-side, but matching here avoids a roundtrip when
        // the user simply mistyped the repeat field.
        if (password !== repeat) {
          setErrors({
            repeat: intl.formatMessage(messages.repeatNotEqual),
          });
          setLoading(false);
          return;
        }

        // BA-native sign-up. The `name` field is BA's. We pass `full_name`
        // and `repeat` as additional fields so cibul-node's `validateSignUp`
        // (services/auth/index.js) sees the same body shape the legacy
        // wrapper used. `mtcaptcha-verifiedtoken` reaches the captcha check
        // the same way.
        const body: Record<string, string> = {
          name: fullName,
          full_name: fullName,
          email,
          password,
          repeat,
          culture,
        };
        if (captchaToken) body['mtcaptcha-verifiedtoken'] = captchaToken;
        if (invitation) body.invitation = invitation;
        if (redirect) body.redirect = redirect;

        // BA reads `callbackURL` from the body and embeds it in the
        // verification email (better-auth/dist/api/routes/sign-up.mjs:241).
        // Mirror the server-side `computePostActivateRedirect` logic
        // (cibul-node/auth/lib/computePostActivateRedirect.js) so that an
        // invitation token is preserved across the verify-email hop and
        // applied by the cibul-node `/post-activate` handler after BA's
        // auto-signin redirect. Without this, invitation links from member
        // mails would lose their token at email-verification time.
        if (invitation) {
          let baseRedirect = '/home';
          if (redirect) {
            const safe = decodeBase64Redirect(redirect);
            if (safe) {
              baseRedirect = safe;
            } else {
              // eslint-disable-next-line no-console
              console.warn('Signup: ignoring unsafe redirect param');
            }
          } else if (agenda) {
            baseRedirect = `/${agenda.slug}/contribute`;
          }
          const params = new URLSearchParams({
            invitation,
            next: baseRedirect,
          });
          body.callbackURL = `/post-activate?${params.toString()}`;
        } else if (redirect) {
          const safe = decodeBase64Redirect(redirect);
          if (safe) {
            body.callbackURL = safe;
          } else {
            // eslint-disable-next-line no-console
            console.warn('Signup: ignoring unsafe redirect param');
          }
        } else {
          // Plain signup (no invitation, no redirect): route through
          // /post-activate with next=/home so the verified user lands on the
          // welcome dashboard instead of better-auth's default `/` (the public
          // marketing page). Mirrors the server-side
          // sendVerificationEmailOnCreate hook (cibul-node) which always
          // defaults next=/home.
          const params = new URLSearchParams({ next: '/home' });
          body.callbackURL = `/post-activate?${params.toString()}`;
        }

        const res = await fetch('/api/auth/sign-up/email', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          // validateSignUp returns `{ errors: { field: code } }`; the auth
          // package re-throws as APIError(BAD_REQUEST) with `details = errors`,
          // so the BA response body is `{ message, details: { field: code } }`.
          const details = data?.details;
          if (details && typeof details === 'object') {
            setErrors(mapErrors(details as Record<string, string>));
            return;
          }
          // BA's user-already-exists case ⇒ 422 + USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL
          if (
            data?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' ||
            data?.code === 'USER_ALREADY_EXISTS'
          ) {
            setErrors(mapErrors({ email: 'usedEmail' }));
            return;
          }
          setMessage(
            data?.message ?? intl.formatMessage(messages.genericError),
          );
          return;
        }

        // Success: BA returned { user, token? }. With `requireEmailVerification:
        // true` and `autoSignIn: false`, no session is opened — the user must
        // verify the email first. Surface the SignupComplete view.
        if (onSignupComplete) {
          // Forward the callbackURL we computed for /sign-up/email so a
          // resend-verification click rebuilds the same post-activation hop
          // (invitation + /post-activate, /home, /<slug>/contribute, …).
          onSignupComplete({ email, callbackURL: body.callbackURL });
          return;
        }
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else if (redirectOnSuccess) {
            window.location.href = redirectOnSuccess;
          } else if (reloadOnSuccess) {
            window.location.reload();
          }
        }, 1000);
      } catch {
        setMessage(intl.formatMessage(messages.genericError));
      } finally {
        setLoading(false);
      }
    },
    [
      agenda,
      fullName,
      email,
      password,
      repeat,
      culture,
      captchaToken,
      invitation,
      redirect,
      onSuccess,
      onSignupComplete,
      redirectOnSuccess,
      reloadOnSuccess,
      mapErrors,
      intl,
    ],
  );

  // OAuth signup goes through the BA `/sign-in/social` POST endpoint —
  // identical in shape to signin, the only difference is the optional
  // `requestSignUp` flag that BA reads when `disableImplicitSignUp` is
  // enabled. Here we just want the user to land on Google and come back
  // signed in or auto-signed-up.
  const startSocial = useCallback(
    async (provider: 'google') => {
      setMessage(null);
      setLoading(true);
      try {
        const callbackURL = agenda ? `/${agenda.slug}/contribute` : '/home';
        const res = await fetch('/api/auth/sign-in/social', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ provider, callbackURL, requestSignUp: true }),
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
    [agenda, intl],
  );

  if (success) {
    return (
      <VStack py="8" gap="4" role="status" aria-live="polite">
        <Text textAlign="center">
          {intl.formatMessage(messages.signupSuccess)}
        </Text>
        <Spinner size="md" />
      </VStack>
    );
  }

  return (
    <>
      <chakra.form
        onSubmit={handleSubmit}
        aria-label={intl.formatMessage(messages.formTitle)}
      >
        <Box
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          p="3"
          mb="6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="3"
          flexWrap="wrap"
        >
          <Text fontWeight="bold" fontSize="sm">
            {intl.formatMessage(messages.hasAccount)}
          </Text>
          {onViewChange ? (
            <Button
              type="button"
              colorPalette="blue"
              size="sm"
              onClick={() => onViewChange('signin')}
            >
              {intl.formatMessage(messages.signinLink)}
            </Button>
          ) : (
            <Button asChild colorPalette="blue" size="sm">
              <a href={agenda ? `/${agenda.slug}/signin` : '/signin'}>
                {intl.formatMessage(messages.signinLink)}
              </a>
            </Button>
          )}
        </Box>

        {message && (
          <MessageAlert
            ref={messageAlertRef}
            tabIndex={-1}
            role="alert"
            status="error"
            mb="4"
          >
            {message}
          </MessageAlert>
        )}

        <Field.Root
          required
          invalid={!!errors.fullName}
          disabled={loading}
          mb="4"
        >
          <Field.Label>
            {intl.formatMessage(messages.fullNameLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            ref={fullNameInputRef}
            id="signup-full-name"
            name="full_name"
            type="text"
            autoComplete="username"
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFullName(e.target.value)
            }
          />
          {errors.fullName ? (
            <Field.ErrorText fontSize="sm">{errors.fullName}</Field.ErrorText>
          ) : (
            <Field.HelperText fontSize="sm">
              {intl.formatMessage(messages.fullNameHelp)}{' '}
              <Link
                href="https://doc.openagenda.com/confidentialite/#votre-compte-utilisateur"
                target="_blank"
                rel="noopener noreferrer"
                color="primary.500"
                fontSize="inherit"
                display="inline"
              >
                {intl.formatMessage(messages.fullNameLearnMore)}
                <chakra.span srOnly>
                  {' '}
                  {intl.formatMessage(messages.opensNewWindow)}
                </chakra.span>
              </Link>
            </Field.HelperText>
          )}
        </Field.Root>

        <Field.Root required invalid={!!errors.email} disabled={loading} mb="4">
          <Field.Label>
            {intl.formatMessage(messages.emailLabel)}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            ref={emailInputRef}
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder={intl.formatMessage(messages.emailPlaceholder)}
          />
          {errors.email && (
            <Field.ErrorText fontSize="sm">{errors.email}</Field.ErrorText>
          )}
        </Field.Root>

        <PasswordField
          id="signup-password"
          name="password"
          label={intl.formatMessage(messages.passwordLabel)}
          value={password}
          onChange={setPassword}
          identifiers={{ fullName, email }}
          required
          invalid={!!errors.password}
          disabled={loading}
          errorText={errors.password}
          inputRef={passwordInputRef}
        />

        <PasswordField
          id="signup-repeat"
          name="repeat"
          label={intl.formatMessage(messages.repeatLabel)}
          value={repeat}
          onChange={setRepeat}
          required
          invalid={!!errors.repeat}
          disabled={loading}
          errorText={errors.repeat}
          inputRef={repeatInputRef}
        />

        <Field.Root disabled={loading} mb="4">
          <Field.Label>{intl.formatMessage(messages.cultureLabel)}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              id="signup-culture"
              name="culture"
              value={culture}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCulture(e.target.value as Culture)
              }
            >
              {CULTURE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  lang={option.value}
                >
                  {option.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {mtCaptchaEnabled && (
          <Field.Root invalid={!!errors.captcha} mb="4">
            <CaptchaWidget
              provider={captchaProvider}
              siteKey={mtCaptchaSiteKey}
              lang={intl.locale}
              onToken={handleCaptchaToken}
              onExpire={handleCaptchaExpire}
              containerRef={captchaContainerRef}
              errorId="signup-captcha-error"
              invalid={!!errors.captcha}
            />
            {errors.captcha && (
              <Field.ErrorText id="signup-captcha-error" fontSize="sm">
                {errors.captcha}
              </Field.ErrorText>
            )}
            {captchaExpired && !errors.captcha && (
              <chakra.span
                key={captchaExpiredCount}
                role="status"
                aria-live="polite"
                display="block"
                fontSize="sm"
                color="orange.500"
                mt="2"
              >
                {intl.formatMessage(messages.captchaExpired)}
              </chakra.span>
            )}
          </Field.Root>
        )}

        <Text
          my="4"
          fontSize="sm"
          color="fg.muted"
          textAlign="center"
          w="full"
          maxW="full"
        >
          {intl.formatMessage(messages.agree, {
            terms: (chunks: React.ReactNode) => (
              <Link
                href="https://doc.openagenda.com/conditions/"
                target="_blank"
                rel="noopener noreferrer"
                color="primary.500"
                fontSize="inherit"
                display="inline"
              >
                {chunks}
                <chakra.span srOnly>
                  {' '}
                  {intl.formatMessage(messages.opensNewWindow)}
                </chakra.span>
              </Link>
            ),
            policy: (chunks: React.ReactNode) => (
              <Link
                href="https://doc.openagenda.com/confidentialite/"
                target="_blank"
                rel="noopener noreferrer"
                color="primary.500"
                fontSize="inherit"
                display="inline"
              >
                {chunks}
                <chakra.span srOnly>
                  {' '}
                  {intl.formatMessage(messages.opensNewWindow)}
                </chakra.span>
              </Link>
            ),
          })}
        </Text>

        <Button type="submit" colorPalette="blue" w="full" loading={loading}>
          {intl.formatMessage(messages.submitLabel)}
        </Button>
      </chakra.form>

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

      <Text mt="4" textAlign="center">
        {intl.formatMessage(messages.alreadyHaveAccount)}{' '}
        {onViewChange ? (
          <Button
            variant="link"
            type="button"
            onClick={() => onViewChange('signin')}
            color="primary.500"
          >
            {intl.formatMessage(messages.signinLink)}
          </Button>
        ) : (
          <Link
            href={agenda ? `/${agenda.slug}/signin` : '/signin'}
            color="primary.500"
          >
            {intl.formatMessage(messages.signinLink)}
          </Link>
        )}
      </Text>
    </>
  );
}
